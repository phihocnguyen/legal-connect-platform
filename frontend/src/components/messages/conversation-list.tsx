import { useState } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserConversation } from '@/domain/entities';
import { formatRelativeTime } from '@/lib/date-utils';

interface ConversationListProps {
  conversations: UserConversation[];
  selectedConversation: UserConversation | null;
  onSelectConversation: (conversation: UserConversation) => void;
  currentUserId?: number;
}

export function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  currentUserId
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <CardHeader className="pb-4 pt-6 px-5 border-b">
        <CardTitle className="text-2xl font-bold mb-5">Messages</CardTitle>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-lg border-gray-200 h-10 bg-gray-50 focus:bg-white transition-colors"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchQuery ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có cuộc trò chuyện nào'}
            </div>
          ) : (
            <div>
              {filteredConversations.map((conversation) => {
                const isSelected = selectedConversation?.id === conversation.id;
                return (
                  <div
                    key={conversation.id}
                    onClick={() => onSelectConversation(conversation)}
                    className={`p-4 cursor-pointer transition-all border-l-[3px] ${
                      isSelected 
                        ? 'bg-teal-50/50 border-teal-600' 
                        : 'border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-12 h-12 ring-2 ring-gray-100">
                          <AvatarImage src={conversation.participant.avatar} alt={conversation.participant.name} />
                          <AvatarFallback className="bg-teal-600 text-white font-medium">
                            {conversation.participant.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.participant.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-semibold text-[15px] truncate text-gray-900">
                              {conversation.participant.name}
                            </h4>
                            {conversation.participant.online && (
                              <span className="text-green-500 text-[10px]">●</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {conversation.lastMessage && (
                              <span className="text-[11px] text-gray-400 font-medium">
                                {formatRelativeTime(conversation.lastMessage.timestamp)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between gap-2">
                          {conversation.lastMessage && (
                            <p className="text-[13px] text-gray-500 truncate flex-1 leading-relaxed">
                              {conversation.lastMessage.senderId === currentUserId
                                ? `${conversation.lastMessage.content}`
                                : conversation.lastMessage.content}
                            </p>
                          )}
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-teal-600 text-white min-w-[18px] h-[18px] rounded-full text-[10px] flex items-center justify-center ml-2 font-medium">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </>
  );
}