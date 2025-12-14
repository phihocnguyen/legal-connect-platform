import { useState, useRef, useEffect, useMemo } from "react";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Phone, Video, MoreVertical, MessageCircle } from "lucide-react";
import { UserConversation, UserMessage } from "@/domain/entities";
import useOnlineUserStore from "@/stores/online-user-store";
import { useWebSocketStore } from "@/stores/web-socket-store";

interface ChatWindowProps {
  conversation: UserConversation | null;
  messages: UserMessage[];
  currentUserId?: number;
  onSendMessage: (content: string) => void;
}

export function ChatWindow({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    fetchOnlineUsers,
    onlineUsers,
    loading: onlineUsersLoading,
  } = useOnlineUserStore();
  const { connected } = useWebSocketStore();
  const getOnlineUsers = useWebSocketStore((s) => s.getOnlineUsers);

  // Rate-limit / debounce online checks to avoid spamming the API on every render
  const lastOnlineCheckRef = useRef<number>(0);

  const doFetchOnlineUsers = useMemo(() => {
    return async () => {
      if (!connected) {
        return;
      }
      if (!getOnlineUsers) return;
      const now = Date.now();
      const MIN_INTERVAL = 2000; // ms
      if (now - (lastOnlineCheckRef.current || 0) < MIN_INTERVAL) {
        // skip if last check was too recent
        return;
      }
      lastOnlineCheckRef.current = now;
      try {
        await fetchOnlineUsers(getOnlineUsers);
      } catch (e) {
        console.warn("Error fetching online users (debounced):", e);
      }
    };
    // Intentionally not including fetchOnlineUsers/getOnlineUsers in deps if they are stable from store
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  useEffect(() => {
    // run once when connection toggles or component mounts
    doFetchOnlineUsers();
  }, [doFetchOnlineUsers]);

  useEffect(() => {
    if (!connected || !getOnlineUsers) return;
    const interval = setInterval(() => {
      doFetchOnlineUsers();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [connected, getOnlineUsers, doFetchOnlineUsers]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && conversation) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate online status with memoization to avoid unnecessary re-calculations
  const isParticipantOnline = useMemo(() => {
    if (onlineUsersLoading || !onlineUsers || !conversation) {
      console.log("🔍 Online check skipped:", {
        loading: onlineUsersLoading,
        hasOnlineUsers: !!onlineUsers,
        hasConversation: !!conversation,
      });
      return false;
    }

    console.log("🔍 Checking online status for participant:", {
      participantId: conversation.participant.id,
      participantIdType: typeof conversation.participant.id,
      participantName: conversation.participant.name,
      participantRole: conversation.participant.role,
      totalUsers: onlineUsers.users?.length || 0,
      totalLawyers: onlineUsers.lawyers?.length || 0,
      totalOnline: onlineUsers.totalOnline,
      allUsers: onlineUsers.users?.map((u) => ({
        id: u.userId,
        idType: typeof u.userId,
        name: u.userName,
        type: u.userType,
        online: u.online,
      })),
      allLawyers: onlineUsers.lawyers?.map((u) => ({
        id: u.userId,
        idType: typeof u.userId,
        name: u.userName,
        type: u.userType,
        online: u.online,
      })),
    });

    const participantIdStr = conversation.participant.id.toString();
    const findExactUser =
      onlineUsers.users?.find((user) => user.userId === participantIdStr) ||
      onlineUsers.lawyers?.find((user) => user.userId === participantIdStr);

    console.log("🔍 Search details:", {
      searchingFor: participantIdStr,
      searchingForType: typeof participantIdStr,
      foundInUsers: onlineUsers.users?.find(
        (user) => user.userId === participantIdStr
      ),
      foundInLawyers: onlineUsers.lawyers?.find(
        (user) => user.userId === participantIdStr
      ),
    });

    console.log(
      "🔍 Found online user:",
      findExactUser
        ? {
            id: findExactUser.userId,
            name: findExactUser.userName,
            type: findExactUser.userType,
            online: findExactUser.online,
          }
        : "NOT FOUND"
    );

    return !!findExactUser;
  }, [onlineUsers, onlineUsersLoading, conversation]);

  // Update participant online status
  if (conversation) {
    conversation.participant.online = isParticipantOnline;
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "lawyer":
        return "bg-[#004646] text-white";
      case "admin":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-600 text-white";
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
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Chọn cuộc trò chuyện</h3>
          <p>Chọn một cuộc trò chuyện từ danh sách để bắt đầu nhắn tin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={conversation.participant.avatar}
                  alt={conversation.participant.name}
                />
                <AvatarFallback>
                  {conversation.participant.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {conversation.participant.online && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">
                  {conversation.participant.name}
                </CardTitle>
                <Badge
                  className={`text-xs ${getRoleColor(
                    conversation.participant.role
                  )}`}
                >
                  {getRoleDisplay(conversation.participant.role)}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                {conversation.participant.online
                  ? "Đang online"
                  : "Không online"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[450px] p-4">
          <div className="space-y-4">
            {messages
              .filter(
                (msg, idx, arr) => arr.findIndex((m) => m.id === msg.id) === idx
              )
              .map((message) => {
                const isCurrentUser = message.senderId === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] ${
                        isCurrentUser ? "order-2" : "order-1"
                      }`}
                    >
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          isCurrentUser
                            ? "bg-[#004646] text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                      </div>
                      <p
                        className={`text-xs text-gray-500 mt-1 ${
                          isCurrentUser ? "text-right" : "text-left"
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
