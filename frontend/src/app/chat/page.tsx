'use client';

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChatMessage, LoadingMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { WelcomeScreen } from "@/components/chat/welcome-screen";
import { DeleteConversationModal, RenameConversationModal } from "@/components/chat/modals";
import { cn } from "@/lib/utils";
import { Trash2, Edit3 } from "lucide-react";
import { useChatUseCases, useChatQAUseCases } from "@/hooks";
import { Message, ChatConversation } from "@/domain/entities";

export default function ChatPage() {
  const router = useRouter();
  const { createConversation, getConversations, sendMessage, getConversationHistory, updateConversationTitle, deleteConversation } = useChatUseCases();
  const { askQuestion } = useChatQAUseCases();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const convs = await getConversations();
        const qaConversations = convs.filter(c => c.type === 'QA');
        setConversations(qaConversations);
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    };
    
    loadConversations();
  }, [getConversations]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!activeConversationId) return;
      
      try {
        setIsLoadingMessages(true);
        const messages = await getConversationHistory(activeConversationId);
        
        setConversations(prev => {
          const conversationIndex = prev.findIndex(c => c.id === activeConversationId);
          if (conversationIndex === -1) return prev;
          
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

  const currentMessages = useMemo(() => 
    activeConversationId 
      ? conversations.find(c => c.id === activeConversationId)?.messages || []
      : []
  , [activeConversationId, conversations]);

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
    let currentConvId = activeConversationId;
    
    // Create new conversation if none exists
    if (!currentConvId) {
      try {
        const conversation = await createConversation("New Conversation");
        // Initialize messages array if not present
        if (!conversation.messages) {
          conversation.messages = [];
        }
        setConversations(prev => [conversation, ...prev]);
        setActiveConversationId(conversation.id);
        currentConvId = conversation.id;
        // Push conversation ID to URL
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

        const formattedAnswer = `${response.answer}\n\n---\n*Model: ${response.model_used}*\n*Processing time: ${response.processing_time.toFixed(2)}s*\n*Time: ${new Date(response.timestamp).toLocaleString()}*`;
        
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
          // Ensure messages array exists
          conversation.messages = conversation.messages || [];
          conversation.messages = [...conversation.messages, assistantMessage];
          conversation.lastMessage = response.answer.substring(0, 50) + '...';
          conversation.updatedAt = new Date();

          updatedConversations[conversationIndex] = conversation;
          return updatedConversations;
        });
      } catch (error) {
        console.error('Error asking question:', error);
        
        // Add error message to UI
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
          // Ensure messages array exists
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

  return (
    <div className="flex h-[calc(100vh-96px)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 flex flex-col border-r bg-white">
        <div className="flex-shrink-0 p-4 border-b">
          <button
            onClick={handleNewChat}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            Cuộc trò chuyện mới
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "p-4 cursor-pointer hover:bg-stone-50 transition-colors",
                activeConversationId === conv.id && "bg-stone-100"
              )}
              onClick={() => {
                setActiveConversationId(conv.id);
                router.push(`/chat?id=${conv.id}`);
              }}
            >
              <div className="flex justify-between items-start group">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {conv.title}
                  </h3>
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {conv.lastMessage}
                  </p>
                </div>
                <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRenameChat(conv);
                    }}
                    className="p-1 text-gray-400 hover:text-teal-600"
                    title="Đổi tên"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(conv);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-stone-50 min-w-0">
        <div className="flex-1 overflow-y-auto">
          <div className="w-full mx-auto p-4">
            {isLoadingMessages ? (
              <div className="flex justify-center items-center h-[75vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              </div>
            ) : !activeConversationId || currentMessages.length === 0 ? (
              <WelcomeScreen onPromptClick={handleSendMessage} />
            ) : (
              <>
                {currentMessages.map((message: Message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                  />
                ))}
              </>
            )}
            
            {isProcessing && <LoadingMessage />}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="flex-shrink-0 border-t bg-white p-4">
          <div className="max-w-3xl mx-auto">
            <ChatInput 
              onSend={handleSendMessage} 
              disabled={isProcessing} 
            />
          </div>
        </div>
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
    </div>
  );
}