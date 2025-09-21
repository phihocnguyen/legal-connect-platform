'use client';

import { useState, useRef, useEffect } from 'react';
import { SendHorizontal, CheckCircle2, AlertCircle, Copy, RotateCcw } from 'lucide-react';
import { PdfMessage } from '@/domain/entities';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status: 'success' | 'error' | 'loading';
}

interface NotebookChatProps {
  conversationId?: number;
  onSendMessage?: (conversationId: number, content: string) => Promise<PdfMessage>;
}

export function NotebookChat({ conversationId, onSendMessage }: NotebookChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing || !conversationId || !onSendMessage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      status: 'loading'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Use the provided onSendMessage function
      const response = await onSendMessage(conversationId, input);
      
      const aiMessage: Message = {
        id: response.id.toString(),
        role: 'assistant',
        content: response.content,
        status: 'success'
      };

      // Update user message status to success
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'success' } 
            : msg
        )
      );
      
      // Add AI response
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update user message status to error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'error' } 
            : msg
        )
      );
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        status: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages section with scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y">
          {messages.map((message) => (
            <div key={message.id} className="group">
              <div className={`flex items-start gap-4 p-6 ${
                message.role === 'user' ? 'bg-gray-50' : 'bg-white'
              }`}>
                {/* Role indicator */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-teal-100 text-teal-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {message.role === 'user' ? 'Y' : 'A'}
                </div>

                {/* Message content */}
                <div className="flex-1 min-w-0">
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* Status indicator */}
                  {message.status === 'loading' && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                      <span>Processing...</span>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    className="p-1 text-gray-400 hover:text-gray-600"
                    onClick={() => navigator.clipboard.writeText(message.content)}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {message.role === 'assistant' && (
                    <button 
                      className="p-1 text-gray-400 hover:text-gray-600"
                      onClick={() => {
                        // Regenerate response logic
                      }}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="w-5 shrink-0">
                  {message.status === 'success' && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                  {message.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />

      {/* Input form - Fixed at bottom */}
      <div className="flex-shrink-0 bg-white border-t shadow-lg">
        <form onSubmit={handleSubmit} className="flex gap-2 p-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={conversationId ? "Ask a question about the document..." : "Upload a document first"}
            className="flex-1 min-w-0 rounded-md border-0 px-4 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
            disabled={isProcessing || !conversationId}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing || !conversationId || !onSendMessage}
            className="inline-flex items-center gap-x-2 rounded-md bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
          >
            <SendHorizontal className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
