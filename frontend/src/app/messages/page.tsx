'use client';

import { useState, useEffect } from 'react';
import { ConversationList } from '@/components/messages/conversation-list';
import { ChatWindow } from '@/components/messages/chat-window';
import { UserListForMessaging } from '@/components/messages/user-list-for-messaging';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { useAuthUseCases } from '@/hooks/use-auth-cases';
import { useMessagingUseCases } from '@/hooks/use-messaging-cases';
import { useMessagingWebSocket } from '@/hooks/use-messaging-websocket';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { UserConversation, UserMessage } from '@/domain/entities';

type ViewMode = 'conversations' | 'newConversation';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<UserConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<UserConversation | null>(null);
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('conversations');
  
  // const searchParams = useSearchParams();
  // const conversationParam = searchParams.get('conversation'); // conversation ID to auto-select
  
  const { getCurrentUser } = useAuthUseCases();
  const { 
    getConversations, 
    getConversationMessages, 
    sendMessage: sendMessageAPI,
    markMessagesAsRead 
  } = useMessagingUseCases();
  
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string } | null>(null);
  const { sendMessage: sendMessageWS } = useMessagingWebSocket({
    conversationId: selectedConversation?.id.toString(),
    otherUserId: selectedConversation?.participant?.email ?? '',
    onMessageReceived: (message) => {
      if (message.conversationId === selectedConversation?.id) {
        setMessages(prev => [...prev, message]);
        setConversations(prev =>
          prev.map(conv =>
            conv.id === selectedConversation?.id
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
      }
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        setCurrentUser({ id: user.id, name: user.fullName });

        // Load conversations
        const userConversations = await getConversations(user.id);
        setConversations(userConversations);
        
      } catch (error) {
        console.error('Error loading messages:', error);
        // Fallback to mock data for development
        setCurrentUser({ id: 1, name: 'Current User' });
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getCurrentUser, getConversations]);

  const handleSelectConversation = async (conversation: UserConversation) => {
    setSelectedConversation(conversation);
    try {
      // Load messages for selected conversation
      const conversationMessages = await getConversationMessages(conversation.id.toString());
      setMessages(conversationMessages);
      
      // Mark messages as read
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
      const newMessage = await sendMessageAPI(
        selectedConversation.id.toString(),
        content,
        currentUser.id
      );

      // Update local state immediately for better UX
      setMessages(prev => [...prev, newMessage]);

      // Update last message in conversation
      setConversations(prev =>
        prev.map(c =>
          c.id === selectedConversation.id
            ? {
                ...c,
                lastMessage: {
                  content,
                  timestamp: newMessage.createdAt,
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
      <div className="container mx-auto py-8">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
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
              messages={messages}
              currentUserId={currentUser?.id}
              onSendMessage={handleSendMessage}
            />
          </Card>
        </div>
      )}
    </div>
  );
}