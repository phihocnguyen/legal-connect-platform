import { useEffect, useRef, useCallback } from 'react';
import { useWebSocketStore } from '@/stores/web-socket-store';
import { UserMessage } from '@/domain/entities';

interface UseMessagingWebSocketProps {
  conversationId?: string;
  otherUserId?: string;
  onMessageReceived?: (message: UserMessage) => void;
  onUserTyping?: (userId: number, isTyping: boolean) => void;
}

export function useMessagingWebSocket({
  conversationId,
  otherUserId,
  onMessageReceived,
  onUserTyping,
}: UseMessagingWebSocketProps) {
  const { connected, subscribe, send } = useWebSocketStore();
  const subscriptionsRef = useRef<Array<{ unsubscribe: () => void } | null>>([]);
  const onMessageReceivedRef = useRef<typeof onMessageReceived | undefined>(onMessageReceived);
  const onUserTypingRef = useRef<typeof onUserTyping | undefined>(onUserTyping);
  const lastConversationRef = useRef<string | undefined>(undefined);
  const subscribedRef = useRef<boolean>(false);

  const sendMessage = useCallback((message: { content: string; senderId: number; isRead: boolean }) => {
    if (connected && otherUserId) {
      console.log('📤 Sending WebSocket message:', {
        content: message.content,
        receiverId: otherUserId,
        senderId: message.senderId,
        conversationId
      });
      const chatMessage = {
        content: message.content,
        receiverId: otherUserId,
        conversationId: conversationId || undefined,
        type: 'CHAT'
      };
      send('/app/chat.private', JSON.stringify(chatMessage));
    } else if (connected && !otherUserId) {
      console.warn('❌ Cannot send WebSocket message: otherUserId not provided yet');
    } else {
      console.warn('❌ Cannot send WebSocket message: not connected');
    }
  }, [connected, otherUserId, send, conversationId]);

  const sendTypingStatus = useCallback((isTyping: boolean) => {
    if (connected && otherUserId) {
      const typingMessage = {
        receiverId: otherUserId,
        type: isTyping ? 'TYPING' : 'STOP_TYPING'
      };
      const endpoint = isTyping ? '/app/chat.typing' : '/app/chat.stop-typing';
      send(endpoint, JSON.stringify(typingMessage));
    }
  }, [connected, otherUserId, send]);

  useEffect(() => {
    // keep refs up to date so we don't need to recreate subscriptions when handlers change
    onMessageReceivedRef.current = onMessageReceived;
    onUserTypingRef.current = onUserTyping;

    // Only subscribe after STOMP is fully connected
    if (!connected) {
      console.log('❌ Not connected, skip subscribing');
      return;
    }

    // Dedupe: If already subscribed for this conversation, skip
    if (subscribedRef.current && lastConversationRef.current === conversationId && subscriptionsRef.current.length > 0) {
      console.log('ℹ️ Already subscribed for this conversation, skip subscribing');
      return;
    }

    // Clean up previous subscriptions
    subscriptionsRef.current.forEach(sub => {
      if (sub?.unsubscribe) {
        try {
          sub.unsubscribe();
        } catch (e) {
          console.warn('Error unsubscribing previous subscription', e);
        }
      }
    });
    subscriptionsRef.current = [];

    // Subscribe to private and typing queues
    const privateMessageSubscription = subscribe('/user/queue/private', (message) => {
      try {
        const messageData = typeof message.body === 'string' ? JSON.parse(message.body) : message.body;
        const userMessage: UserMessage = {
          id: parseInt(messageData.id) || Date.now(),
          conversationId: parseInt(messageData.conversationId as string) || 0,
          senderId: parseInt(messageData.senderId as string),
          senderName: messageData.senderName,
          content: messageData.content,
          isRead: false,
          createdAt: messageData.timestamp || new Date().toISOString(),
        };
        onMessageReceivedRef.current?.(userMessage);
      } catch (error) {
        console.error('❌ Error parsing private message:', error, {
          rawBody: message.body,
        });
      }
    });
    const typingSubscription = subscribe('/user/queue/typing', (message) => {
      try {
        const typingData = JSON.parse(message.body);
        const isTyping = typingData.type === 'TYPING';
        onUserTypingRef.current?.(parseInt(typingData.senderId), isTyping);
      } catch (error) {
        console.error('Error parsing typing status:', error);
      }
    });

    subscriptionsRef.current = [privateMessageSubscription, typingSubscription].filter(Boolean);
    subscribedRef.current = true;
    lastConversationRef.current = conversationId;

    console.log('✅ Subscribed to user queues after connection:', {
      conversationId,
      otherUserId,
      subscriptionCount: subscriptionsRef.current.length
    });

    return () => {
      subscriptionsRef.current.forEach(sub => {
        if (sub?.unsubscribe) {
          try {
            sub.unsubscribe();
          } catch (e) {
            console.warn('Error during unsubscribe in cleanup', e);
          }
        }
      });
      subscriptionsRef.current = [];
      subscribedRef.current = false;
      lastConversationRef.current = undefined;
    };
  }, [connected, conversationId, subscribe, otherUserId, onMessageReceived, onUserTyping]);

  return {
    connected,
    sendMessage,
    sendTypingStatus,
  };
}