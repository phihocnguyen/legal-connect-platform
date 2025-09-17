import { cn } from "@/lib/utils";
import { Avatar } from "../ui/avatar";
import { Card } from "../ui/card";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={cn(
      "flex items-start gap-4 py-6",
      isUser ? "flex-row-reverse" : ""
    )}>
      <Avatar className={cn(
        "h-8 w-8",
        isUser ? "bg-teal-600" : "bg-zinc-800"
      )}>
        <div className="flex h-full items-center justify-center">
          {isUser ? (
            <User className="h-5 w-5 text-white" />
          ) : (
            <Bot className="h-5 w-5 text-white" />
          )}
        </div>
      </Avatar>

      <Card className={cn(
        "p-4 max-w-[70%]",  // cho phép tối đa 70% chiều rộng cha
        isUser ? "ml-auto bg-teal-600 text-white" : "mr-auto bg-white"
      )}>
        <div className="prose prose-sm max-w-none">
          {isUser ? (
            <div className="whitespace-pre-wrap">{content}</div>
          ) : (
            <div
              className={cn(
                "prose prose-sm max-w-none",
                "prose-headings:font-semibold prose-headings:text-gray-900",
                "prose-p:text-gray-700 prose-p:leading-relaxed",
                "prose-code:text-gray-900 prose-code:bg-gray-100 prose-code:rounded prose-code:px-1",
                "prose-pre:bg-gray-100 prose-pre:border prose-pre:border-gray-200",
                "prose-ul:list-disc prose-ul:pl-4",
                "prose-ol:list-decimal prose-ol:pl-4",
                "prose-li:text-gray-700",
                "prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline"
              )}
            >
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}


export function LoadingMessage() {
  return (
    <div className="flex items-start gap-4 py-6">
      <Avatar className="h-8 w-8 bg-zinc-800">
        <div className="flex h-full items-center justify-center">
          <Bot className="h-5 w-5 text-white" />
        </div>
      </Avatar>
      <Card className="w-24 h-8 animate-pulse bg-gray-200" />
    </div>
  );
}
