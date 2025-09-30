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

  const sendMessage = useCallback((message: { content: string; senderId: number; isRead: boolean }) => {
    if (connected && otherUserId) {
      const chatMessage = {
        content: message.content,
        receiverId: otherUserId,
        type: 'CHAT'
      };
      send('/app/chat.private', JSON.stringify(chatMessage));
    }
  }, [connected, otherUserId, send]);

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
    // Hủy subscription cũ trước khi tạo mới
    subscriptionsRef.current.forEach(sub => {
      if (sub?.unsubscribe) {
        sub.unsubscribe();
      }
    });
    subscriptionsRef.current = [];

    // Chỉ subscribe khi đã connect và có conversationId
    if (!connected || !conversationId) return;

    // Đăng ký subscription mới
    const privateMessageSubscription = subscribe(
      '/user/queue/private',
      (message) => {
        try {
          const messageData = JSON.parse(message.body);
          const userMessage: UserMessage = {
            id: parseInt(messageData.id) || Date.now(),
            conversationId: parseInt(conversationId || '0'),
            senderId: parseInt(messageData.senderId),
            senderName: messageData.senderName,
            content: messageData.content,
            isRead: false,
            createdAt: messageData.timestamp || new Date().toISOString()
          };
          onMessageReceived?.(userMessage);
        } catch (error) {
          console.error('Error parsing private message:', error);
        }
      }
    );
    const typingSubscription = subscribe(
      '/user/queue/typing',
      (message) => {
        try {
          const typingData = JSON.parse(message.body);
          const isTyping = typingData.type === 'TYPING';
          onUserTyping?.(parseInt(typingData.senderId), isTyping);
        } catch (error) {
          console.error('Error parsing typing status:', error);
        }
      }
    );

    subscriptionsRef.current = [
      privateMessageSubscription,
      typingSubscription,
    ].filter(Boolean);

    // Cleanup subscription khi conversationId hoặc connected thay đổi
    return () => {
      subscriptionsRef.current.forEach(sub => {
        if (sub?.unsubscribe) {
          sub.unsubscribe();
        }
      });
      subscriptionsRef.current = [];
    };
  }, [connected, conversationId, subscribe, onMessageReceived, onUserTyping]);

  return {
    connected,
    sendMessage,
    sendTypingStatus,
  };
}