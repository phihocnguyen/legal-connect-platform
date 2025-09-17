import { Button } from "@/components/ui/button";
import { PlusCircle, MessageCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatHistoryProps {
  conversations: {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
  }[];
  activeId?: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export function ChatHistory({ conversations, activeId, onSelect, onNew, onDelete }: ChatHistoryProps) {
  return (
    <div className="w-80 h-full flex flex-col border-r bg-white">
      <div className="p-4 border-b">
        <Button 
          onClick={onNew}
          className="w-full gap-2 bg-teal-600 hover:bg-teal-700"
        >
          <PlusCircle className="w-4 h-4" />
          Cuộc trò chuyện mới
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-sm text-gray-500 text-center">
            Chưa có cuộc trò chuyện nào
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "group p-4 cursor-pointer hover:bg-stone-50 transition-colors",
                  activeId === conv.id && "bg-stone-100 hover:bg-stone-100"
                )}
                onClick={() => onSelect(conv.id)}
              >
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-gray-500 mt-1" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {conv.title}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.lastMessage}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(conv.timestamp).toLocaleDateString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conv.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
