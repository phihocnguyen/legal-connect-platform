'use client';

import { useEffect, useRef, useState, useMemo } from "react";
import { ChatMessage, LoadingMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { WelcomeScreen } from "@/components/chat/welcome-screen";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chat-conversations');
      if (saved) {
        return JSON.parse(saved, (key, value) => {
          if (key === 'timestamp') return new Date(value);
          return value;
        });
      }
    }
    return [];
  });

  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);


  const currentMessages = useMemo(() => 
    activeConversationId 
      ? conversations.find(c => c.id === activeConversationId)?.messages || []
      : []
  , [activeConversationId, conversations]);


  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('chat-conversations', JSON.stringify(conversations));
    }
  }, [conversations]);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isProcessing]);

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newConversation: Conversation = {
      id: newId,
      title: "Cuộc trò chuyện mới",
      lastMessage: "",
      timestamp: new Date(),
      messages: []
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newId);
  };

  const handleDeleteChat = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa cuộc trò chuyện này?')) {
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(undefined);
      }
    }
  };

  const updateConversation = (id: string, message: Message, isFirstMessage = false) => {
    setConversations(prev => {
      const conversationIndex = prev.findIndex(c => c.id === id);
      if (conversationIndex === -1) return prev;

      const updatedConversations = [...prev];
      const conversation = { ...updatedConversations[conversationIndex] };


      conversation.messages = [...conversation.messages, message];
      conversation.lastMessage = message.content.slice(0, 100) + (message.content.length > 100 ? "..." : "");
      conversation.timestamp = new Date();


      if (isFirstMessage && message.role === 'user') {
        conversation.title = conversation.lastMessage;
      }

      updatedConversations[conversationIndex] = conversation;
      return updatedConversations;
    });
  };
  const handleSendMessage = async (content: string) => {
    let currentId = activeConversationId;
    if (!currentId) {
      currentId = Date.now().toString();
      const newConversation: Conversation = {
        id: currentId,
        title: content.slice(0, 100) + (content.length > 100 ? "..." : ""),
        lastMessage: content,
        timestamp: new Date(),
        messages: []
      };
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversationId(currentId);
    }
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };
    updateConversation(currentId, userMessage, true);
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      const aiContent = `Đây là phản hồi cho câu hỏi của bạn: "${content}".\n\nDưới đây là một ví dụ về code block trong Markdown:\n\n\`\`\`javascript\nconsole.log("Hello, Gemini!");\n\`\`\`\n\n* Đây là một mục danh sách.\n* Và đây là mục thứ hai.`;
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiContent,
      };
      updateConversation(currentId, aiMessage);

    } catch (error) {
      console.error('Lỗi khi gọi API:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
      };
      updateConversation(currentId, errorMessage);
    } finally {
      setIsProcessing(false);
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
              onClick={() => setActiveConversationId(conv.id)}
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChat(conv.id);
                  }}
                  className="ml-2 p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-stone-50 min-w-0">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full mx-auto p-4">
            {!activeConversationId || currentMessages.length === 0 ? (
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

        {/* Input Area */}
        <div className="flex-shrink-0 border-t bg-white p-4">
          <div className="max-w-3xl mx-auto">
            <ChatInput 
              onSend={handleSendMessage} 
              disabled={isProcessing} 
            />
          </div>
        </div>
      </main>
    </div>
  );
}