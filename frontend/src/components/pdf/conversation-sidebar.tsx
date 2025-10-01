'use client';

import { PlusCircle, MessageSquare, Trash2, Edit3, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

interface Conversation {
  id: string | number;
  title: string;
  timestamp?: Date;
  updatedAt?: Date;
  lastMessage?: string;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeId?: string | number;
  onSelect: (id: string | number) => void;
  onDelete: (conversation: Conversation) => void;
  onRename?: (conversation: Conversation) => void;
  onNew: () => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  newButtonText?: string;
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onRename,
  onNew,
  className,
  isCollapsed = false,
  onToggleCollapse,
  newButtonText = "Cuộc trò chuyện mới",
}: ConversationSidebarProps) {
  const getDisplayDate = (conversation: Conversation) => {
    const date = conversation.updatedAt || conversation.timestamp;
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  return (
    <TooltipProvider>
      <div 
        className={cn(
          "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
          isCollapsed ? "w-[60px]" : "w-80",
          className
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-sm font-semibold text-gray-900">
              Cuộc trò chuyện
            </h2>
          )}
          <div className="flex items-center gap-2">
            {!isCollapsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onNew}
                    className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                  >
                    <PlusCircle className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{newButtonText}</p>
                </TooltipContent>
              </Tooltip>
            )}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className={cn(
                  "w-5 h-5 transition-transform",
                  isCollapsed && "rotate-180"
                )} />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-auto py-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors",
                activeId === conversation.id && "bg-gray-100",
                isCollapsed && "justify-center"
              )}
              onClick={() => onSelect(conversation.id)}
            >
              <MessageSquare 
                className={cn(
                  "w-5 h-5 shrink-0",
                  activeId === conversation.id ? "text-teal-600" : "text-gray-400"
                )} 
              />
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conversation.title}
                    </p>
                    {(conversation.lastMessage || getDisplayDate(conversation)) && (
                      <p className="text-xs text-gray-500 truncate">
                        {conversation.lastMessage || getDisplayDate(conversation)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onRename && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRename(conversation);
                        }}
                        className="p-1 text-gray-400 hover:text-teal-600 rounded"
                        title="Đổi tên"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(conversation);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
