'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ConversationList } from '@/components/messages/conversation-list';
import { ChatWindow } from '@/components/messages/chat-window';
import { UserListForMessaging } from '@/components/messages/user-list-for-messaging';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { useAuthUseCases } from '@/hooks/use-auth-cases';
import { useMessagingUseCases } from '@/hooks/use-messaging-cases';
import { useMessagingWebSocket } from '@/hooks/use-messaging-websocket';
import { useWebSocketStore } from '@/stores/web-socket-store';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { UserConversation, UserMessage } from '@/domain/entities';

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

  useEffect(() => {
    if (currentUser) {
      useWebSocketStore.getState().connect();
    }
  }, [currentUser]);
  const wsProps = selectedConversation
    ? {
        conversationId: selectedConversation.id.toString(),
        otherUserId: selectedConversation.participant?.email ?? undefined,
        onMessageReceived: (message: UserMessage) => {
          setConversations(prev =>
            prev.map(conv =>
              conv.id === message.conversationId
                ? {
                    ...conv,
                    lastMessage: {
                      content: message.content,
                      timestamp: message.createdAt,
                      senderId: message.senderId
                    },
                    unreadCount: message.senderId !== currentUser?.id ? conv.unreadCount + 1 : conv.unreadCount
                  }
                : conv
            )
          );
          if (selectedConversation.id === message.conversationId) {
            setMessages(prev => {
              const newArr = [...prev, message];
              return newArr.filter((msg, idx, arr) => arr.findIndex(m => m.id === msg.id) === idx);
            });
          }
        },
      }
    : {};

  const { sendMessage: sendMessageWS } = useMessagingWebSocket(wsProps);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        if (!user) {
          throw new Error('User not authenticated');
        }
        setCurrentUser({ id: user.id, name: user.fullName });
        useWebSocketStore.getState().connect(); // Gọi connect ngay khi user đã xác thực
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
        setSelectedConversation(conv);
      } else {
        setSelectedConversation(null);
        setMessages([]);
      }
    } else if (conversations.length > 0 && !conversationParam) {
      setSelectedConversation(null);
      setMessages([]);
    }
  }, [conversations, conversationParam]);

  useEffect(() => {
    if (selectedConversation) {
      getConversationMessages(selectedConversation.id.toString()).then(setMessages);
    } else {
      setMessages([]);
    }
  }, [selectedConversation, getConversationMessages]);

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

    try {
      // Send message via API for persistence
      await sendMessageAPI(
        selectedConversation.id.toString(),
        content,
        currentUser.id
      );

      // Không tự push vào mảng messages, chỉ cập nhật khi nhận qua WebSocket

      // Update last message in conversation (optional, có thể bỏ nếu muốn đồng bộ hoàn toàn qua WebSocket)
      setConversations(prev =>
        prev.map(c =>
          c.id === selectedConversation.id
            ? {
                ...c,
                lastMessage: {
                  content,
                  timestamp: new Date().toISOString(),
                  senderId: currentUser.id
                }
              }
            : c
        )
      );

      // Try to send via WebSocket for real-time to other users
      try {
        sendMessageWS({
          content,
          senderId: currentUser.id,
          isRead: false
        });
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