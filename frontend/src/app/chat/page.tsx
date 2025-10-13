'use client';

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChatMessage, LoadingMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { WelcomeScreen } from "@/components/chat/welcome-screen";
import { DeleteConversationModal, RenameConversationModal } from "@/components/chat/modals";
import { ConversationSidebar } from "@/components/pdf/conversation-sidebar";
import { ApiKeyInput } from '@/components/shared/api-key-input';
import { ApiLimitModal } from '@/components/shared/api-limit-modal';
import { useChatUseCases, useChatQAUseCases } from "@/hooks";
import { useApiKey } from '@/hooks/use-user-cases';
import { Message, ChatConversation } from "@/domain/entities";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from 'sonner';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createConversation, getConversations, sendMessage, getConversationHistory, updateConversationTitle, deleteConversation } = useChatUseCases();
  const { askQuestion } = useChatQAUseCases();
  const { apiKey, getMyApiKey } = useApiKey();
  
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // API Key state
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const [showApiLimitModal, setShowApiLimitModal] = useState(false);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  // Read URL parameter on mount
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setActiveConversationId(id);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoadingConversations(true);
        const storedKey = localStorage.getItem('user_api_key');
        if (storedKey) {
          setIsApiKeyValid(true);
        }
        
        await getMyApiKey();
        
        const convs = await getConversations();
        const qaConversations = convs.filter(c => c.type === 'QA');
        setConversations(prev => {
          // Preserve messages for conversations that already have them loaded
          return qaConversations.map(newConv => {
            const existingConv = prev.find(c => c.id == newConv.id);
            if (existingConv && existingConv.messages && existingConv.messages.length > 0) {
              return { ...newConv, messages: existingConv.messages };
            }
            return newConv;
          });
        });
        
        // If we have an activeConversationId from URL but it's not in the list, 
        // the loadMessages effect will handle adding it
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setIsLoadingConversations(false);
      }
    };
    
    loadConversations();
  }, [getConversations, getMyApiKey]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!activeConversationId) return;
      
      try {
        setIsLoadingMessages(true);
        console.log('🔥 Loading messages for conversationId:', activeConversationId);
        const messages = await getConversationHistory(activeConversationId);
        console.log('🔥 API returned messages:', messages);
        setConversations(prev => {
          const conversationIndex = prev.findIndex(c => c.id == activeConversationId);
          if (conversationIndex === -1) {
            // If conversation doesn't exist in list, create a placeholder
            return [...prev, {
              id: activeConversationId,
              title: 'Loading...',
              messages: messages || [],
              type: 'QA',
              createdAt: new Date(),
              updatedAt: new Date(),
              lastMessage: messages && messages.length > 0 ? messages[messages.length - 1].content : ''
            }];
          }
          
          const updatedConversations = [...prev];
          updatedConversations[conversationIndex] = {
            ...updatedConversations[conversationIndex],
            messages: messages || []
          };
          
          return updatedConversations;
        });
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    
    loadMessages();
  }, [activeConversationId, getConversationHistory]);

  const currentMessages = useMemo(() => {
    console.log('Debug - activeConversationId:', activeConversationId);
    console.log('Debug - conversations:', conversations);
    const found = activeConversationId 
      ? conversations.find(c => c.id == activeConversationId)
      : null;
    console.log('Debug - found conversation:', found);
    console.log('Debug - messages:', found?.messages);
    return found?.messages || [];
  }, [activeConversationId, conversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isProcessing]);

  const handleNewChat = async () => {
    try {
      const conversation = await createConversation("New Conversation");
      // Initialize messages array if not present
      if (!conversation.messages) {
        conversation.messages = [];
      }
      setConversations(prev => [conversation, ...prev]);
      setActiveConversationId(conversation.id);
      // Push conversation ID to URL
      router.push(`/chat?id=${conversation.id}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleDeleteChat = (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedConversation) return;
    
    try {
      setIsDeleting(true);
      await deleteConversation(selectedConversation.id);
      setConversations(prev => prev.filter(c => c.id !== selectedConversation.id));
      if (activeConversationId === selectedConversation.id) {
        setActiveConversationId(undefined);
        router.push('/chat');
      }
      setIsDeleteModalOpen(false);
      setSelectedConversation(null);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRenameChat = (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    setIsRenameModalOpen(true);
  };

  const handleConfirmRename = async (newTitle: string) => {
    if (!selectedConversation) return;
    
    try {
      setIsRenaming(true);
      await updateConversationTitle(selectedConversation.id, newTitle);
      setConversations(prev => 
        prev.map(c => c.id === selectedConversation.id ? { ...c, title: newTitle } : c)
      );
      setIsRenameModalOpen(false);
      setSelectedConversation(null);
    } catch (error) {
      console.error('Error renaming conversation:', error);
      throw error; // Re-throw to let modal handle the error
    } finally {
      setIsRenaming(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    // Check API key validity and limit
    if (!isApiKeyValid) {
      toast.error('Vui lòng xác thực API key trước khi gửi tin nhắn');
      return;
    }

    if (apiKey && apiKey.remainingCalls <= 0) {
      setShowApiLimitModal(true);
      return;
    }

    let currentConvId = activeConversationId;
    if (!currentConvId) {
      try {
        const conversation = await createConversation("New Conversation");
        if (!conversation.messages) {
          conversation.messages = [];
        }
        setConversations(prev => [conversation, ...prev]);
        setActiveConversationId(conversation.id);
        currentConvId = conversation.id;
        router.push(`/chat?id=${conversation.id}`);
      } catch (error) {
        console.error('Error creating conversation:', error);
        return;
      }
    }
    
    if (currentConvId) {
      setIsProcessing(true);
      
      // Add user message to UI immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        role: 'USER',
        createdAt: new Date(),
      };
      
      setConversations(prev => {
        const conversationIndex = prev.findIndex(c => c.id === currentConvId);
        if (conversationIndex === -1) return prev;

        const updatedConversations = [...prev];
        const conversation = { ...updatedConversations[conversationIndex] };
        // Ensure messages array exists
        conversation.messages = conversation.messages || [];
        conversation.messages = [...conversation.messages, userMessage];
        conversation.lastMessage = content;
        conversation.updatedAt = new Date();

        updatedConversations[conversationIndex] = conversation;
        return updatedConversations;
      });

      try {
        await sendMessage(currentConvId, content, 'USER');

        const response = await askQuestion(content, 3);

        const formattedAnswer = `${response.answer}`;
        
        await sendMessage(currentConvId, formattedAnswer, 'ASSISTANT');
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: formattedAnswer,
          role: 'ASSISTANT',
          createdAt: new Date(),
        };
        
        setConversations(prev => {
          const conversationIndex = prev.findIndex(c => c.id === currentConvId);
          if (conversationIndex === -1) return prev;

          const updatedConversations = [...prev];
          const conversation = { ...updatedConversations[conversationIndex] };
          conversation.messages = conversation.messages || [];
          conversation.messages = [...conversation.messages, assistantMessage];
          conversation.lastMessage = response.answer.substring(0, 50) + '...';
          conversation.updatedAt = new Date();

          updatedConversations[conversationIndex] = conversation;
          return updatedConversations;
        });
      } catch (error) {
        console.error('Error asking question:', error);
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại.',
          role: 'ASSISTANT',
          createdAt: new Date(),
        };
        
        setConversations(prev => {
          const conversationIndex = prev.findIndex(c => c.id === currentConvId);
          if (conversationIndex === -1) return prev;

          const updatedConversations = [...prev];
          const conversation = { ...updatedConversations[conversationIndex] };
          conversation.messages = conversation.messages || [];
          conversation.messages = [...conversation.messages, errorMessage];
          
          updatedConversations[conversationIndex] = conversation;
          return updatedConversations;
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if(isLoadingConversations) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
        <LoadingSpinner size="lg"/>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-81px)] overflow-hidden">
      <ConversationSidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={(id) => {
          setActiveConversationId(id as string);
          router.push(`/chat?id=${id}`);
        }}
        onDelete={(conv) => handleDeleteChat(conv as ChatConversation)}
        onRename={(conv) => handleRenameChat(conv as ChatConversation)}
        onNew={handleNewChat}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main className="flex-1 flex flex-col bg-stone-50 min-w-0">
        {!isApiKeyValid ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              <ApiKeyInput 
                onValidKey={() => {
                  setIsApiKeyValid(true);
                  toast.success('API key đã được xác thực thành công!');
                }}
                featureName="Chat Q/A"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto px-4 py-6">
                {isLoadingMessages ? (
                  <div className="flex justify-center items-center h-[calc(100vh-300px)]">
                    <div className="text-center space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                      <p className="text-gray-500 text-sm">Đang tải tin nhắn...</p>
                    </div>
                  </div>
                ) : !activeConversationId || currentMessages.length === 0 ? (
                  <WelcomeScreen onPromptClick={handleSendMessage} />
                ) : (
                  <div className="space-y-6">
                    {currentMessages.map((message: Message) => (
                      <ChatMessage
                        key={message.id}
                        role={message.role}
                        content={message.content}
                      />
                    ))}
                  </div>
                )}
                
                {isProcessing && <LoadingMessage />}
                <div ref={bottomRef} />
              </div>
            </div>

            <div className="flex-shrink-0 border-t bg-white shadow-sm">
              <div className="max-w-4xl mx-auto px-4 py-4">
                <ChatInput 
                  onSend={handleSendMessage} 
                  disabled={isProcessing} 
                />
                <p className="text-xs text-gray-400 text-center mt-2">
                  AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
                </p>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConversationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedConversation(null);
        }}
        onConfirm={handleConfirmDelete}
        conversationTitle={selectedConversation?.title || ''}
        isDeleting={isDeleting}
      />

      {/* Rename Conversation Modal */}
      <RenameConversationModal
        isOpen={isRenameModalOpen}
        onClose={() => {
          setIsRenameModalOpen(false);
          setSelectedConversation(null);
        }}
        onConfirm={handleConfirmRename}
        currentTitle={selectedConversation?.title || ''}
        isRenaming={isRenaming}
      />

      {/* API Limit Modal */}
      <ApiLimitModal
        open={showApiLimitModal}
        onClose={() => setShowApiLimitModal(false)}
        remainingCalls={apiKey?.remainingCalls || 0}
      />
    </div>
  );
}