"use client";

import { useState, useRef, useEffect } from "react";
import { PdfMessage } from "@/domain/entities";
import { ChatMessage, LoadingMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";

interface NotebookChatProps {
  conversationId?: number;
  onSendMessage?: (
    conversationId: number,
    content: string
  ) => Promise<PdfMessage>;
  initialMessages?: PdfMessage[];
  isLoadingMessages?: boolean;
}

export function NotebookChat({
  conversationId,
  onSendMessage,
  initialMessages,
  isLoadingMessages = false,
}: NotebookChatProps) {
  const [messages, setMessages] = useState<PdfMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevConversationIdRef = useRef<number | undefined>(conversationId);

  // Load initial messages from conversation when provided
  useEffect(() => {
    // If conversation changed, clear messages first to prevent showing old messages
    if (prevConversationIdRef.current !== conversationId) {
      setMessages([]);
      prevConversationIdRef.current = conversationId;
    }

    // Then load new messages when they arrive
    if (!isLoadingMessages) {
      if (initialMessages && initialMessages.length > 0) {
        setMessages(initialMessages);
      } else if (!isProcessing) {
        // Only clear if not processing a new message
        setMessages([]);
      }
    }
  }, [initialMessages, conversationId, isLoadingMessages, isProcessing]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSend = async (content: string) => {
    if (!conversationId || !onSendMessage) return;

    // Create temporary user message
    const tempUserMessage: PdfMessage = {
      id: Date.now(),
      conversationId: conversationId,
      content: content,
      role: "USER",
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, tempUserMessage]);
    setIsProcessing(true);

    try {
      // Send message and get assistant response
      const response = await onSendMessage(conversationId, content);

      // Add AI response
      setMessages((prev) => [...prev, response]);
    } catch (error) {
      console.error("Error sending message:", error);

      // Add error message
      const errorMessage: PdfMessage = {
        id: Date.now() + 1,
        conversationId: conversationId,
        content:
          "Xin lỗi, đã có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại.",
        role: "ASSISTANT",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-w-0 overflow-hidden">
      {/* Messages section with scroll */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 px-4">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
            />
          ))}

          {isProcessing && <LoadingMessage />}
        </div>

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form - Fixed at bottom */}
      <div className="flex-shrink-0 bg-white border-t min-w-0 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSend={handleSend}
            disabled={isProcessing || !conversationId}
          />
        </div>
      </div>
    </div>
  );
}
