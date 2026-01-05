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
  
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const [showApiLimitModal, setShowApiLimitModal] = useState(false);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  
  const isSendingMessageRef = useRef(false);
  const previousConversationIdRef = useRef<string | undefined>(undefined);

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
          return qaConversations.map(newConv => {
            const existingConv = prev.find(c => c.id == newConv.id);
            if (existingConv && existingConv.messages && existingConv.messages.length > 0) {
              return { ...newConv, messages: existingConv.messages };
            }
            return newConv;
          });
        });
        
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
      
      if (isSendingMessageRef.current) {
        console.log('⏭️ Skipping message load - currently sending message');
        return;
      }
      
      if (previousConversationIdRef.current === activeConversationId) {
        console.log('⏭️ Skipping message load - same conversation');
        return;
      }
      
      previousConversationIdRef.current = activeConversationId;
      
      try {
        setIsLoadingMessages(true);
        console.log('🔥 Loading messages for conversationId:', activeConversationId);
        const messages = await getConversationHistory(activeConversationId);
        console.log('🔥 API returned messages:', messages);
        setConversations(prev => {
          const conversationIndex = prev.findIndex(c => c.id == activeConversationId);
          if (conversationIndex === -1) {
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
  }, [activeConversationId]);

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
      if (!conversation.messages) {
        conversation.messages = [];
      }
      setConversations(prev => [conversation, ...prev]);
      setActiveConversationId(conversation.id);
      
      previousConversationIdRef.current = conversation.id;
      
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
    console.log('🚀 handleSendMessage called with:', content.substring(0, 50));
    
    if (isProcessing) {
      console.warn('⚠️ Already processing a message, ignoring duplicate call');
      return;
    }
    
    if (!isApiKeyValid) {
      toast.error('Vui lòng xác thực API key trước khi gửi tin nhắn');
      return;
    }

    if (apiKey && apiKey.remainingCalls <= 0) {
      setShowApiLimitModal(true);
      return;
    }

    let currentConvId = activeConversationId;
    let isNewConversation = false;
    let newConversation: ChatConversation | null = null;
    
    if (!currentConvId) {
      try {
        console.log('🆕 Creating new conversation from welcome screen...');
        
        const conversationTitle = content.length > 50 
          ? content.substring(0, 50) + '...' 
          : content;
        const conversation = await createConversation(conversationTitle);
        conversation.messages = [];
        
        console.log('✅ Conversation created:', {
          id: conversation.id,
          idType: typeof conversation.id,
          title: conversation.title
        });
        
        currentConvId = conversation.id;
        isNewConversation = true;
        newConversation = conversation;
        
        setActiveConversationId(conversation.id);
        router.push(`/chat?id=${conversation.id}`);
        
        previousConversationIdRef.current = conversation.id;
        
        console.log('📝 Current conversation ID set to:', currentConvId);
      } catch (error) {
        console.error('Error creating conversation:', error);
        toast.error('Không thể tạo cuộc trò chuyện. Vui lòng thử lại.');
        return;
      }
    }
    
    isSendingMessageRef.current = true;
    
    const userMessage: Message = {
      id: `temp-user-${Date.now()}`,
      content,
      role: 'USER',
      createdAt: new Date(),
    };
    
    console.log('✅ Adding user message optimistically:', userMessage);
    console.log('✅ Current conversation ID:', currentConvId);
    console.log('✅ Is new conversation:', isNewConversation);
    
    setConversations(prev => {
      console.log('✅ Current conversations in state:', prev.map(c => c.id));
      console.log('✅ Current conversation ID type:', typeof currentConvId, currentConvId);
      console.log('✅ State conversation ID types:', prev.map(c => ({ id: c.id, type: typeof c.id })));
      console.log('✅ isNewConversation:', isNewConversation);
      console.log('✅ newConversation:', newConversation ? { id: newConversation.id, title: newConversation.title } : null);
      
      const conversationIndex = prev.findIndex(c => c.id == currentConvId);
      console.log('✅ conversationIndex:', conversationIndex);
      
      if (conversationIndex === -1 && isNewConversation && newConversation) {
        console.log('✅ Adding new conversation to state with message');
        newConversation.messages = [userMessage];
        newConversation.lastMessage = content;
        newConversation.updatedAt = new Date();
        return [newConversation, ...prev];
      }
      
      if (conversationIndex === -1) {
        console.error('❌ CRITICAL: Conversation not found in list:', currentConvId);
        console.error('❌ Available conversations:', prev.map(c => ({ id: c.id, title: c.title })));
        console.error('❌ isNewConversation:', isNewConversation);
        console.error('❌ newConversation:', newConversation);
        console.error('❌ This should not happen! Returning prev state without changes.');
        return prev;
      }

      console.log('✅ Updating existing conversation at index:', conversationIndex);
      const updatedConversations = [...prev];
      const conversation = { ...updatedConversations[conversationIndex] };
      conversation.messages = conversation.messages || [];
      conversation.messages = [...conversation.messages, userMessage];
      conversation.lastMessage = content;
      conversation.updatedAt = new Date();

      updatedConversations[conversationIndex] = conversation;
      return updatedConversations;
    });

    setIsProcessing(true);

    try {
      console.log('🚀 Sending message to backend...');
      
      const currentConversation = conversations.find(c => c.id == currentConvId);
      const chatHistory = currentConversation?.messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      })) || [];
      
      console.log('📜 Sending chat history:', chatHistory.length, 'messages');
      
      const [savedUserMessage, response] = await Promise.all([
        sendMessage(currentConvId, content, 'USER'),
        askQuestion(content, 5, currentConvId, chatHistory)
      ]);

      console.log('✅ User message saved:', savedUserMessage);
      console.log('✅ AI response received:', response);

      const formattedAnswer = `${response.answer}`;
      
      const savedAssistantMessage = await sendMessage(currentConvId, formattedAnswer, 'ASSISTANT');
      console.log('✅ AI message saved:', savedAssistantMessage);
      
      const assistantMessage: Message = {
        id: savedAssistantMessage?.id || `temp-assistant-${Date.now()}`,
        content: formattedAnswer,
        role: 'ASSISTANT',
        createdAt: new Date(),
      };
      
      console.log('✅ Adding AI message to UI:', assistantMessage);
      
      setConversations(prev => {
        const conversationIndex = prev.findIndex(c => c.id == currentConvId);
        if (conversationIndex === -1) {
          console.warn('⚠️ Conversation not found when adding AI response');
          return prev;
        }

        const updatedConversations = [...prev];
        const conversation = { ...updatedConversations[conversationIndex] };
        conversation.messages = conversation.messages || [];
        
        const messages = conversation.messages.map(msg => 
          msg.id === userMessage.id && savedUserMessage?.id
            ? { ...msg, id: savedUserMessage.id }
            : msg
        );
        
        conversation.messages = [...messages, assistantMessage];
        conversation.lastMessage = response.answer.substring(0, 50) + '...';
        conversation.updatedAt = new Date();

        updatedConversations[conversationIndex] = conversation;
        return updatedConversations;
      });
    } catch (error) {
      console.error('❌ Error asking question:', error);
      toast.error('Không thể xử lý câu hỏi. Vui lòng thử lại.');
      
      const errorMessage: Message = {
        id: `temp-error-${Date.now()}`,
        content: 'Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.',
        role: 'ASSISTANT',
        createdAt: new Date(),
      };
      
      setConversations(prev => {
        const conversationIndex = prev.findIndex(c => c.id == currentConvId);
        if (conversationIndex === -1) {
          console.warn('⚠️ Conversation not found when adding error message');
          return prev;
        }

        const updatedConversations = [...prev];
        const conversation = { ...updatedConversations[conversationIndex] };
        conversation.messages = conversation.messages || [];
        conversation.messages = [...conversation.messages, errorMessage];
        
        updatedConversations[conversationIndex] = conversation;
        return updatedConversations;
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        isSendingMessageRef.current = false;
        console.log('🔓 Message sending complete, unlocking loadMessages');
      }, 500);
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

      <main className="flex-1 flex flex-col bg-gradient-to-b from-gray-50 to-white min-w-0">
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
        ) : !activeConversationId || (currentMessages.length === 0 && !isProcessing) ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl space-y-8">
              <WelcomeScreen onPromptClick={handleSendMessage} disabled={isProcessing} />
              <ChatInput 
                onSend={handleSendMessage} 
                disabled={isProcessing} 
              />
              <p className="text-xs text-gray-400 text-center">
                AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto chat-smooth-scroll chat-custom-scrollbar">
              <div className="max-w-4xl mx-auto px-6 py-8">
                {isLoadingMessages ? (
                  <div className="flex justify-center items-center h-[calc(100vh-300px)]">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {currentMessages.map((message: Message) => (
                      <ChatMessage
                        key={message.id}
                        role={message.role}
                        content={message.content}
                      />
                    ))}
                    {isProcessing && <LoadingMessage />}
                  </div>
                )}
                
                <div ref={bottomRef} />
              </div>
            </div>

            <div className="flex-shrink-0 border-t bg-white/80 backdrop-blur-sm shadow-lg">
              <div className="max-w-4xl mx-auto px-6 py-6">
                <ChatInput 
                  onSend={handleSendMessage} 
                  disabled={isProcessing} 
                />
                <p className="text-xs text-gray-400 text-center mt-3">
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