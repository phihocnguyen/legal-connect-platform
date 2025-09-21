'use client';

import { PlusCircle, MessageSquare, Trash2, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse: () => void;
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onNew,
  className,
  isCollapsed = false,
  onToggleCollapse,
}: ConversationSidebarProps) {
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
              Conversations
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
                  <p>New conversation</p>
                </TooltipContent>
              </Tooltip>
            )}
            <button
              onClick={onToggleCollapse}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className={cn(
                "w-5 h-5 transition-transform",
                isCollapsed && "rotate-180"
              )} />
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-auto py-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50",
                activeId === conversation.id && "bg-gray-50",
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
                    <p className="text-xs text-gray-500">
                      {conversation.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conversation.id);
                    }}
                    className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
