import { useState, useRef, useEffect, useMemo } from "react";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Phone, Video, MoreVertical, MessageCircle, ArrowDown, Smile, Paperclip, Mic } from "lucide-react";
import { UserConversation, UserMessage } from "@/domain/entities";
import useOnlineUserStore from "@/stores/online-user-store";
import { useWebSocketStore } from "@/stores/web-socket-store";
import { formatMessageTime } from "@/lib/date-utils";

interface ChatWindowProps {
  conversation: UserConversation | null;
  messages: UserMessage[];
  currentUserId?: number;
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export function ChatWindow({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  isLoading = false,
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const {
    fetchOnlineUsers,
    onlineUsers,
    loading: onlineUsersLoading,
  } = useOnlineUserStore();
  const { connected } = useWebSocketStore();
  const getOnlineUsers = useWebSocketStore((s) => s.getOnlineUsers);

  const lastOnlineCheckRef = useRef<number>(0);

  const doFetchOnlineUsers = useMemo(() => {
    return async () => {
      if (!connected) return;
      if (!getOnlineUsers) return;
      const now = Date.now();
      const MIN_INTERVAL = 2000;
      if (now - (lastOnlineCheckRef.current || 0) < MIN_INTERVAL) return;
      lastOnlineCheckRef.current = now;
      try {
        await fetchOnlineUsers(getOnlineUsers);
      } catch (e) {
        console.warn("Error fetching online users:", e);
      }
    };
  }, [connected]);

  useEffect(() => {
    doFetchOnlineUsers();
  }, [doFetchOnlineUsers]);

  useEffect(() => {
    if (!connected || !getOnlineUsers) return;
    const interval = setInterval(() => {
      doFetchOnlineUsers();
    }, 30000);
    return () => clearInterval(interval);
  }, [connected, getOnlineUsers, doFetchOnlineUsers]);

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? "smooth" : "auto",
        block: "end"
      });
    }
  };

  const isUserAtBottom = () => {
    if (!scrollAreaRef.current) return true;
    const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollContainer) return true;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    const threshold = 100;
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  useEffect(() => {
    const isNewConversation = prevMessagesLengthRef.current === 0 && messages.length > 0;
    const isNewMessage = messages.length > prevMessagesLengthRef.current;
    
    if (isNewConversation) {
      setTimeout(() => scrollToBottom(false), 100);
    } else if (isNewMessage) {
      if (isUserAtBottom()) {
        scrollToBottom(true);
        setHasNewMessages(false);
      } else {
        setHasNewMessages(true);
      }
    }
    
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    prevMessagesLengthRef.current = 0;
    setHasNewMessages(false);
  }, [conversation?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && conversation) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const formatTime = (timestamp: string) => {
    // Parse UTC timestamp and convert to Vietnam timezone (UTC+7)
    const date = new Date(timestamp + 'Z'); // Ensure it's treated as UTC
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh"
    });
  };

  const isParticipantOnline = useMemo(() => {
    if (onlineUsersLoading || !onlineUsers || !conversation) return false;
    const participantIdStr = conversation.participant.id.toString();
    const findExactUser =
      onlineUsers.users?.find((user) => user.userId === participantIdStr) ||
      onlineUsers.lawyers?.find((user) => user.userId === participantIdStr);
    return !!findExactUser;
  }, [onlineUsers, onlineUsersLoading, conversation]);

  if (conversation) {
    conversation.participant.online = isParticipantOnline;
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "lawyer":
        return "bg-gradient-to-r from-pink-500 to-purple-500 text-white";
      case "admin":
        return "bg-gradient-to-r from-red-500 to-orange-500 text-white";
      default:
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "lawyer":
        return "Luật sư";
      case "admin":
        return "Admin";
      default:
        return "Thành viên";
    }
  };

  if (!conversation) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-teal-600 rounded-full flex items-center justify-center">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">
            Select a conversation
          </h3>
          <p className="text-sm text-gray-500">Choose a conversation from the list to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <CardHeader className="border-b bg-white py-4 px-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-11 h-11">
                <AvatarImage
                  src={conversation.participant.avatar}
                  alt={conversation.participant.name}
                />
                <AvatarFallback className="bg-teal-600 text-white font-medium">
                  {conversation.participant.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {conversation.participant.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold text-gray-900">
                  {conversation.participant.name}
                </CardTitle>
                {conversation.participant.online && (
                  <span className="text-green-500 text-[10px]">●</span>
                )}
              </div>
              <p className="text-[13px] text-gray-500 mt-0.5">
                {conversation.participant.role === 'lawyer' ? '1-Bedroom Apartment, 45 m²' : ''}
                {conversation.participant.role === 'lawyer' && ' • $80/night'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="hover:bg-gray-100 h-9 w-9 p-0 rounded-full">
              <Phone className="w-4 h-4 text-gray-600" />
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-gray-100 h-9 w-9 p-0 rounded-full">
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <div className="flex-1 relative overflow-hidden">
        <ScrollArea className="h-full p-6 bg-white" ref={scrollAreaRef}>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${i % 2 === 0 ? 'order-2' : 'order-1'}`}>
                    <div className="rounded-2xl px-4 py-3 bg-gray-200 animate-pulse">
                      <div className="h-4 bg-gray-300 rounded w-48"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-16 mt-1 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {messages
                .filter((msg, idx, arr) => arr.findIndex((m) => m.id === msg.id) === idx)
                .map((message) => {
                  const isCurrentUser = message.senderId === currentUserId;
                  return (
                    <div
                      key={message.id}
                      className={`flex items-end gap-2 ${isCurrentUser ? "justify-end" : "justify-start"}`}
                    >
                      {!isCurrentUser && (
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={conversation.participant.avatar} />
                          <AvatarFallback className="bg-teal-600 text-white text-xs">
                            {conversation.participant.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={`max-w-[70%] ${isCurrentUser ? "order-2" : "order-1"}`}>
                        <div
                          className={`rounded-2xl px-4 py-2.5 ${
                            isCurrentUser
                              ? "bg-teal-600 text-white rounded-br-md"
                              : "bg-gray-100 text-gray-900 rounded-bl-md"
                          }`}
                        >
                          <p className="break-words leading-relaxed text-[14px]">{message.content}</p>
                        </div>
                        <p className={`text-[11px] text-gray-400 mt-1 px-1 font-medium ${
                          isCurrentUser ? "text-right" : "text-left"
                        }`}>
                          {formatMessageTime(message.createdAt)}
                          {isCurrentUser && message.isRead && (
                            <span className="ml-1 text-teal-600">✓✓</span>
                          )}
                        </p>
                      </div>

                      {isCurrentUser && (
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="bg-teal-600 text-white text-xs">
                            {currentUserId ? "U" : "?"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Floating "New Messages" Button */}
        {hasNewMessages && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <Button
              onClick={() => {
                scrollToBottom(true);
                setHasNewMessages(false);
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg rounded-full px-5 py-2.5 flex items-center gap-2 animate-bounce hover:animate-none transition-all"
            >
              <ArrowDown className="w-4 h-4" />
              <span className="font-medium">Tin nhắn mới</span>
            </Button>
          </div>
        )}
      </div>

      {/* Message Input - Fixed at bottom */}
      <div className="border-t bg-white p-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="hover:bg-gray-100 text-gray-500 h-9 w-9 rounded-full flex-shrink-0"
          >
            <Mic className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Your message"
              className="rounded-full border border-gray-200 focus:border-teal-300 pr-10 h-10 text-[14px] bg-gray-50 focus:bg-white transition-colors"
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-gray-100 text-gray-400 h-8 w-8 rounded-full"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          
          <Button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="rounded-full h-10 w-10 p-0 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
