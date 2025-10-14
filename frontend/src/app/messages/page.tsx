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

  // Chỉ log khi có thay đổi quan trọng
  useEffect(() => {
    console.log('🔌 WebSocket props setup:', {
      activeConversationId,
      hasActiveConversation: !!activeConversation,
      otherUserId: activeConversation?.participant?.email,
      conversationParam,
      selectedConversationId: selectedConversation?.id,
      conversationsLoaded: conversations.length > 0
    });
  }, [activeConversationId, activeConversation, conversationParam, selectedConversation?.id, conversations.length]);

  const onMessageReceived = useCallback((message: UserMessage) => {
    console.log('🔔 Message received via WebSocket:', {
      message,
      activeConversationId,
      currentUserId: currentUser?.id,
      messageConversationId: message.conversationId,
      shouldAddToMessages: parseInt(activeConversationId || '0') === message.conversationId,
      activeConversationIdType: typeof activeConversationId,
      messageConversationIdType: typeof message.conversationId
    });

    setConversations(prev => {
      let changed = false;
      const next = prev.map(conv => {
        if (conv.id !== message.conversationId) return conv;
        const newLast = {
          content: message.content,
          timestamp: message.createdAt,
          senderId: message.senderId
        };
        const sameLast = conv.lastMessage &&
          conv.lastMessage.content === newLast.content &&
          conv.lastMessage.timestamp === newLast.timestamp &&
          conv.lastMessage.senderId === newLast.senderId;
        if (sameLast) return conv;
        changed = true;
        return {
          ...conv,
          lastMessage: newLast,
          unreadCount: message.senderId !== currentUser?.id ? conv.unreadCount + 1 : conv.unreadCount
        };
      });
      return changed ? next : prev;
    });

    // Chỉ thêm vào messages nếu đang ở conversation đó
    if (parseInt(activeConversationId || '0') === message.conversationId) {
      console.log('✅ Adding/reconciling message to current conversation');
      setMessages(prev => {
        console.log('📝 Current messages before reconciling:', prev.length);

        // Try to find a temporary/optimistic message that matches this server-persisted message.
        // Matching heuristics: same conversationId, same senderId, same content, and createdAt
        // within a small time window (5s). If found, replace that temp message with the
        // persisted message (so the UI shows a single authoritative message with real id).
        const messageTime = new Date(message.createdAt).getTime();
        const MATCH_WINDOW_MS = 5000;

        const tempIndex = prev.findIndex(m =>
          m.conversationId === message.conversationId &&
          m.senderId === message.senderId &&
          m.content === message.content &&
          Math.abs(new Date(m.createdAt).getTime() - messageTime) <= MATCH_WINDOW_MS
        );

        let newArr: UserMessage[];
        if (tempIndex !== -1) {
          // Replace the temp message with the server message
          newArr = [...prev];
          newArr[tempIndex] = message;
          console.log('🔁 Replaced optimistic message at index', tempIndex, 'with server message', message.id);
        } else {
          // No matching optimistic message found — append normally
          newArr = [...prev, message];
          console.log('➕ Appended server message', message.id);
        }

        // Final dedup by id as a safety net
        const deduplicated = newArr.filter((msg, idx, arr) => arr.findIndex(m => m.id === msg.id) === idx);
        console.log('📝 Messages after reconcile and dedup:', deduplicated.length);
        return deduplicated;
      });
    } else {
      console.log('❌ Message not for current conversation, skipping');
    }
  }, [activeConversationId, currentUser?.id]);

  // Use global store for websocket actions (provider owns the connection)
  const subscribe = useWebSocketStore(s => s.subscribe);
  const send = useWebSocketStore(s => s.send);
  const connected = useWebSocketStore(s => s.connected);

  // Subscribe to conversation-specific topic once both the websocket is connected
  // and the active conversation data is available. This avoids the race where
  // the page loads (and the provider connects) but the conversation list hasn't
  // arrived yet so the topic subscription would be skipped.
  const wsSubscribe = subscribe;
  const wsConnected = connected;

  // Track the last conversation id we subscribed to in this component
  const lastSubscribedRef = useRef<number | string | null>(null);
  const currentSubRef = useRef<StompSubscription | null>(null);
  const onMessageReceivedRef = useRef(onMessageReceived);

  // Keep ref updated but avoid using onMessageReceived itself in the subscription effect deps
  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
  }, [onMessageReceived]);

  // ...removed ws:private-message listener effect, now only using topic subscription...

  useEffect(() => {
    const convId = activeConversation?.id;
    if (!wsConnected || !convId) return;

    const dest = `/topic/conversation/${convId}`;
    if (lastSubscribedRef.current == convId) return;
    try {
      const w = (window as unknown) as Record<string, unknown> & { __stompSubscriptions?: Array<Record<string, unknown>> };
      const subs = w.__stompSubscriptions || [];
      if (subs.find(s => (s as Record<string, unknown>)['destination'] == dest)) {
        console.log('ℹ️ Found existing global subscription for', dest, '- skipping subscribe');
        lastSubscribedRef.current = convId;
        return;
      }
    } catch {
      // ignore
    }

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
        const rawBody = (msg as unknown as Record<string, unknown>)['body'];
        console.error('Error handling conversation topic message:', error, { raw: rawBody });
      }
    });

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.log('🔔 Conversation subscription created', { id: sub ? (sub as any).id : null });
    } catch {}

  currentSubRef.current = sub;
    lastSubscribedRef.current = activeConversation.id;

    return () => {
      try {
        const s = currentSubRef.current as StompSubscription | null;
        if (s && 'unsubscribe' in s && typeof (s as unknown as { unsubscribe: () => void }).unsubscribe === 'function') {
          try { (s as unknown as { unsubscribe: () => void }).unsubscribe(); } catch (err) { console.warn('Error during unsubscribe', err); }
        }
      } catch (e) {
        console.warn('Error unsubscribing conversation topic', e);
      }
      currentSubRef.current = null;
      lastSubscribedRef.current = null;
    };
  }, [wsConnected, activeConversation?.id, wsSubscribe]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        if (!user) {
          throw new Error('User not authenticated');
        }
        setCurrentUser({ id: user.id, name: user.fullName });
        // Không gọi connect ở đây nữa vì WebSocketProvider đã quản lý
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

  useEffect(() => {
    if (conversations.length > 0 && conversationParam) {
      const conv = conversations.find(c => c.id.toString() === conversationParam);
      if (conv) {
        console.log('🔗 Auto-connecting to conversation from URL:', conversationParam);
        setSelectedConversation(conv);
        
        // Mark messages as read như trong handleSelectConversation
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

  useEffect(() => {
    if (selectedConversation) {
      getConversationMessages(selectedConversation.id.toString()).then(setMessages);
    } else if (conversationParam && conversations.length > 0) {
      // Load messages cho conversation từ URL ngay cả khi selectedConversation chưa được set
      const conv = conversations.find(c => c.id.toString() === conversationParam);
      if (conv) {
        getConversationMessages(conversationParam).then(setMessages);
      }
    } else {
      setMessages([]);
    }
  }, [selectedConversation, conversationParam, conversations, getConversationMessages]);

  const handleSelectConversation = async (conversation: UserConversation) => {
    setSelectedConversation(conversation);
    router.push(`/messages?conversation=${conversation.id}`);
    try {
      const conversationMessages = await getConversationMessages(conversation.id.toString());
      setMessages(conversationMessages);
      if (currentUser && conversation.unreadCount > 0) {
        await markMessagesAsRead(conversation.id.toString(), currentUser.id);
        setConversations(prev => 
          prev.map(c => 
            c.id === conversation.id 
              ? { ...c, unreadCount: 0 }
              : c
          )
        );
      }
    } catch (error) {
      console.error('Error loading conversation messages:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !currentUser) return;

    console.log('💬 Sending message:', {
      content,
      conversationId: selectedConversation.id,
      currentUserId: currentUser.id,
      otherUserId: activeConversation?.participant?.email
    });

    try {
      // Send message via API for persistence
      console.log('📡 Sending message via API:', {
        conversationId: selectedConversation.id.toString(),
        content,
        senderId: currentUser.id
      });
      await sendMessageAPI(
        selectedConversation.id.toString(),
        content,
        currentUser.id
      );
      console.log('✅ Message saved via API successfully');

      // Tạo message object để thêm vào UI ngay lập tức cho người gửi
      // Sử dụng id tạm thời âm để dễ phân biệt với id server và cho phép
      // reconciliation khi server gửi lại message đã persist.
      const sentMessage: UserMessage = {
        id: -Date.now(), // Temporary negative ID
        conversationId: selectedConversation.id,
        senderId: currentUser.id,
        senderName: currentUser.name,
        content,
        isRead: true, // Người gửi đã đọc message của mình
        createdAt: new Date().toISOString()
      };

      console.log('📝 Adding sent message to UI immediately:', sentMessage);
      setMessages(prev => {
        const newArr = [...prev, sentMessage];
        return newArr.filter((msg, idx, arr) => arr.findIndex(m => m.id === msg.id) === idx);
      });

      // Update last message in conversation
      setConversations(prev => {
        let changed = false;
        const now = new Date().toISOString();
        const next = prev.map(c => {
          if (c.id !== selectedConversation.id) return c;
          const newLast = { content, timestamp: now, senderId: currentUser.id };
          const sameLast = c.lastMessage &&
            c.lastMessage.content === newLast.content &&
            c.lastMessage.timestamp === newLast.timestamp &&
            c.lastMessage.senderId === newLast.senderId;
          if (sameLast) return c;
          changed = true;
          return { ...c, lastMessage: newLast };
        });
        return changed ? next : prev;
      });

      // Try to send via WebSocket for real-time to other users
      // Also send via WebSocket so other participants receive the message in real-time.
      // Our reconciliation logic will replace the optimistic temporary message when
      // the server broadcasts the persisted message back to participants.
      try {
        // Send via global STOMP client to the private chat endpoint expected by the backend
        try {
          const receiverId = activeConversation?.participant?.email;
          if (!receiverId) {
            console.warn('Cannot send WebSocket private message: receiver id not available');
          } else {
            const wsPayload = {
              content,
              receiverId,
              conversationId: selectedConversation.id,
              type: 'CHAT'
            };
            // Backend maps @MessageMapping("/chat.private") -> use /app/chat.private
            send('/app/chat.private', JSON.stringify(wsPayload));
            console.log('📤 Sending WebSocket message:', { content, receiverId, conversationId: selectedConversation.id });
          }
        } catch (wsError) {
          console.warn('WebSocket message send failed, but message was saved via API:', wsError);
        }
      } catch (wsError) {
        console.warn('WebSocket message send failed, but message was saved via API:', wsError);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error - could show toast notification
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
        <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tin nhắn</h1>
          <p className="text-gray-600 mt-2">
            Trao đổi trực tiếp với các thành viên và luật sư
          </p>
        </div>
        {/* Toggle between conversations and new conversation */}
        <div className="flex gap-2">
          {viewMode === 'newConversation' ? (
            <Button 
              variant="outline" 
              onClick={() => setViewMode('conversations')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Messages
            </Button>
          ) : (
            <Button 
              onClick={() => setViewMode('newConversation')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Conversation
            </Button>
          )}
        </div>
      </div>

      {viewMode === 'newConversation' ? (
        <div className="max-w-4xl mx-auto">
          <UserListForMessaging currentUserId={currentUser?.id || 1} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
          <Card className="lg:col-span-1">
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              currentUserId={currentUser?.id}
            />
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2">
            <ChatWindow
              conversation={selectedConversation}
              messages={selectedConversation ? messages : []}
              currentUserId={currentUser?.id}
              onSendMessage={handleSendMessage}
            />
          </Card>
        </div>
      )}
    </div>
  );
}