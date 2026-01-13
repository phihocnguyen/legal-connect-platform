'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ConversationList } from '@/components/messages/conversation-list';
import { ChatWindow } from '@/components/messages/chat-window';
import { UserListForMessaging } from '@/components/messages/user-list-for-messaging';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { useAuthUseCases } from '@/hooks/use-auth-cases';
import { useMessagingUseCases } from '@/hooks/use-messaging-cases';
import { useWebSocketStore } from '@/stores/web-socket-store';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { UserConversation, UserMessage } from '@/domain/entities';
import { StompSubscription } from '@stomp/stompjs';

type ViewMode = 'conversations' | 'newConversation';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<UserConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<UserConversation | null>(null);
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('conversations');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationParam = searchParams.get('conversation');
  
  const { getCurrentUser } = useAuthUseCases();
  const { getConversations, getConversationMessages, sendMessage: sendMessageAPI, markMessagesAsRead } = useMessagingUseCases();
  
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string } | null>(null);

  const activeConversationId = conversationParam || selectedConversation?.id.toString();
  const activeConversation = useMemo(() =>
    selectedConversation ||
    (conversationParam ? conversations.find(c => c.id.toString() === conversationParam) : undefined),
    [selectedConversation, conversationParam, conversations]
  );

  // Track processed message IDs to prevent duplicates
  const processedMessageIds = useRef<Set<number>>(new Set());

  const onMessageReceived = useCallback((message: UserMessage) => {
    console.log('🔔 Message received via WebSocket:', {
      messageId: message.id,
      conversationId: message.conversationId,
      activeConversationId,
      alreadyProcessed: processedMessageIds.current.has(message.id)
    });

    // Skip if already processed
    if (processedMessageIds.current.has(message.id)) {
      console.log('⏭️ Skipping duplicate message:', message.id);
      return;
    }

    // Mark as processed
    processedMessageIds.current.add(message.id);

    // Update conversation list
    setConversations(prev => {
      const next = prev.map(conv => {
        if (conv.id !== message.conversationId) return conv;
        return {
          ...conv,
          lastMessage: {
            content: message.content,
            timestamp: message.createdAt,
            senderId: message.senderId
          },
          unreadCount: message.senderId !== currentUser?.id ? conv.unreadCount + 1 : conv.unreadCount
        };
      });
      return next;
    });

    // Add to messages if it's for the active conversation
    if (parseInt(activeConversationId || '0') === message.conversationId) {
      console.log('✅ Adding message to current conversation');
      setMessages(prev => {
        // Check if message already exists
        const exists = prev.some(m => m.id === message.id);
        if (exists) {
          console.log('⏭️ Message already in list, skipping');
          return prev;
        }
        return [...prev, message];
      });
    }
  }, [activeConversationId, currentUser?.id]);

  const subscribe = useWebSocketStore(s => s.subscribe);
  const send = useWebSocketStore(s => s.send);
  const connected = useWebSocketStore(s => s.connected);

  const wsSubscribe = subscribe;
  const wsConnected = connected;

  const lastSubscribedRef = useRef<number | string | null>(null);
  const currentSubRef = useRef<StompSubscription | null>(null);
  const onMessageReceivedRef = useRef(onMessageReceived);

  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
  }, [onMessageReceived]);

  // WebSocket subscription
  useEffect(() => {
    const convId = activeConversation?.id;
    if (!wsConnected || !convId) return;

    const dest = `/topic/conversation/${convId}`;
    if (lastSubscribedRef.current === convId) return;

    console.log('🔔 Subscribing to conversation topic:', dest);

    const sub = wsSubscribe(dest, (msg) => {
      try {
        const payload = typeof msg.body === 'string' ? JSON.parse(msg.body) : msg.body;
        console.log('📥 Received conversation topic message:', { dest, payload });
        const userMessage: UserMessage = {
          id: parseInt(payload.id) || Date.now(),
          conversationId: parseInt(payload.conversationId as string) || convId,
          senderId: parseInt(payload.senderId as string),
          senderName: payload.senderName,
          content: payload.content,
          isRead: false,
          createdAt: payload.timestamp || new Date().toISOString(),
        };
        onMessageReceivedRef.current?.(userMessage);
      } catch (error) {
        console.error('Error handling conversation topic message:', error);
      }
    });

    currentSubRef.current = sub;
    lastSubscribedRef.current = convId;

    return () => {
      try {
        const s = currentSubRef.current as StompSubscription | null;
        if (s && 'unsubscribe' in s && typeof (s as unknown as { unsubscribe: () => void }).unsubscribe === 'function') {
          (s as unknown as { unsubscribe: () => void }).unsubscribe();
        }
      } catch (e) {
        console.warn('Error unsubscribing conversation topic', e);
      }
      currentSubRef.current = null;
      lastSubscribedRef.current = null;
    };
  }, [wsConnected, activeConversation?.id, wsSubscribe]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        if (!user) {
          throw new Error('User not authenticated');
        }
        setCurrentUser({ id: user.id, name: user.fullName });
        const userConversations = await getConversations(user.id);
        setConversations(userConversations);
      } catch (error) {
        console.error('Error loading messages:', error);
        setCurrentUser({ id: 1, name: 'Current User' });
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [getCurrentUser, getConversations]);

  // Auto-select conversation from URL
  useEffect(() => {
    if (conversations.length > 0 && conversationParam) {
      const conv = conversations.find(c => c.id.toString() === conversationParam);
      if (conv) {
        console.log('🔗 Auto-connecting to conversation from URL:', conversationParam);
        setSelectedConversation(conv);
        
        if (currentUser && conv.unreadCount > 0) {
          markMessagesAsRead(conversationParam, currentUser.id).then(() => {
            setConversations(prev => 
              prev.map(c => 
                c.id.toString() === conversationParam 
                  ? { ...c, unreadCount: 0 }
                  : c
              )
            );
          }).catch(error => {
            console.error('Error marking messages as read:', error);
          });
        }
      } else {
        setSelectedConversation(null);
        setMessages([]);
      }
    } else if (conversations.length > 0 && !conversationParam) {
      setSelectedConversation(null);
      setMessages([]);
    }
  }, [conversations, conversationParam, currentUser, markMessagesAsRead]);

  // Load messages when conversation changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversation && !conversationParam) {
        setMessages([]);
        setMessagesLoading(false);
        return;
      }

      const convId = selectedConversation?.id.toString() || conversationParam;
      if (!convId) return;

      try {
        // CLEAR OLD MESSAGES IMMEDIATELY to prevent flash of old content
        setMessages([]);
        setMessagesLoading(true);
        
        // Clear processed IDs when switching conversations
        processedMessageIds.current.clear();
        
        const conversationMessages = await getConversationMessages(convId);
        
        // Mark all loaded messages as processed
        conversationMessages.forEach(msg => {
          processedMessageIds.current.add(msg.id);
        });
        
        setMessages(conversationMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
        setMessages([]);
      } finally {
        setMessagesLoading(false);
      }
    };

    loadMessages();
  }, [selectedConversation?.id, conversationParam, getConversationMessages]);

  const handleSelectConversation = async (conversation: UserConversation) => {
    setSelectedConversation(conversation);
    router.push(`/messages?conversation=${conversation.id}`);
    
    if (currentUser && conversation.unreadCount > 0) {
      try {
        await markMessagesAsRead(conversation.id.toString(), currentUser.id);
        setConversations(prev => 
          prev.map(c => 
            c.id === conversation.id 
              ? { ...c, unreadCount: 0 }
              : c
          )
        );
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !currentUser) return;

    console.log('💬 Sending message:', {
      content,
      conversationId: selectedConversation.id,
      currentUserId: currentUser.id
    });

    // Create optimistic message
    const optimisticMessage: UserMessage = {
      id: -Date.now(), // Temporary negative ID
      conversationId: selectedConversation.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content,
      isRead: true,
      createdAt: new Date().toISOString()
    };

    // Add optimistic message immediately
    setMessages(prev => [...prev, optimisticMessage]);

    // Update conversation list
    setConversations(prev => {
      const now = new Date().toISOString();
      return prev.map(c => {
        if (c.id !== selectedConversation.id) return c;
        return { 
          ...c, 
          lastMessage: { 
            content, 
            timestamp: now, 
            senderId: currentUser.id 
          } 
        };
      });
    });

    try {
      // Send via API
      await sendMessageAPI(
        selectedConversation.id.toString(),
        content,
        currentUser.id
      );
      console.log('✅ Message saved via API successfully');

      // Send via WebSocket for real-time delivery
      try {
        const receiverId = activeConversation?.participant?.email;
        if (receiverId) {
          const wsPayload = {
            content,
            receiverId,
            conversationId: selectedConversation.id,
            type: 'CHAT'
          };
          send('/app/chat.private', JSON.stringify(wsPayload));
          console.log('📤 Sent WebSocket message');
        }
      } catch (wsError) {
        console.warn('WebSocket send failed, but message was saved:', wsError);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" text="Đang tải..." />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] bg-white overflow-hidden fixed inset-x-0 top-[64px]">
      {viewMode === 'newConversation' ? (
        <div className="p-8 h-full overflow-auto">
          <Button 
            variant="outline" 
            onClick={() => setViewMode('conversations')}
            className="flex items-center gap-2 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Messages
          </Button>
          <div className="max-w-4xl mx-auto">
            <UserListForMessaging currentUserId={currentUser?.id || 1} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] h-full">
          {/* Left Sidebar - Conversation List */}
          <div className="border-r border-gray-200 bg-white overflow-hidden">
            <Card className="h-full rounded-none border-0 shadow-none">
              <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
                currentUserId={currentUser?.id}
              />
            </Card>
          </div>

          {/* Right Side - Chat Window */}
          <div className="bg-white overflow-hidden">
            <Card className="h-full rounded-none border-0 shadow-none">
              <ChatWindow
                conversation={selectedConversation}
                messages={messages}
                currentUserId={currentUser?.id}
                onSendMessage={handleSendMessage}
                isLoading={messagesLoading}
              />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}