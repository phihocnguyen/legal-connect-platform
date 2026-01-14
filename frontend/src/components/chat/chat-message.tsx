import { cn } from "@/lib/utils";
import { Avatar } from "../ui/avatar";
import { Card } from "../ui/card";
import { Bot, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useAuth } from "@/contexts/auth-context";
import { formatMessageTime } from "@/lib/date-utils";
import { AvatarImage } from "@radix-ui/react-avatar";
import { motion } from "framer-motion";
import { useState } from "react";
import "prismjs/themes/prism-tomorrow.css";

interface ChatMessageProps {
  role: "USER" | "ASSISTANT";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming = false }: ChatMessageProps) {
  const isUser = role === "USER";
  const { user } = useAuth();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }}
      className={cn(
        "flex items-start gap-4 py-6 px-4 group",
        isUser ? "flex-row-reverse" : ""
      )}
    >
      {/* Avatar */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.2 }}
      >
        <Avatar 
          className={cn(
            "h-9 w-9 ring-2 ring-offset-2 transition-all duration-200",
            isUser 
              ? "bg-teal-600 ring-teal-200" 
              : "bg-gray-800 ring-gray-200"
          )}
        >
          <div className="flex h-full w-full items-center justify-center">
            {isUser ? (
              <AvatarImage 
                src={user?.avatar} 
                alt={user?.fullName}
                className="rounded-full"
              />
            ) : (
              <Bot className="h-5 w-5 text-white" />
            )}
          </div>
        </Avatar>
      </motion.div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 min-w-0 max-w-[85%]",
        isUser && "flex justify-end"
      )}>
        <Card
          className={cn(
            "p-4 transition-all duration-200",
            isUser 
              ? "bg-teal-600 text-white border-teal-500 shadow-lg" 
              : "bg-white border-gray-200 shadow-md hover:shadow-lg",
            "rounded-2xl"
          )}
        >
          <div className={cn(
            "prose prose-sm max-w-none",
            isUser && "prose-invert"
          )}>
            {isUser ? (
              <div className="whitespace-pre-wrap text-white leading-relaxed">
                {content}
              </div>
            ) : (
              <div
                className={cn(
                  "prose prose-sm max-w-none",
                  "prose-headings:font-semibold prose-headings:text-gray-900 prose-headings:mt-6 prose-headings:mb-3",
                  "prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-3",
                  "prose-strong:text-gray-900 prose-strong:font-semibold",
                  "prose-code:text-teal-700 prose-code:bg-teal-50 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none",
                  "prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-xl prose-pre:my-4 prose-pre:shadow-lg",
                  "prose-ul:list-disc prose-ul:pl-6 prose-ul:my-3",
                  "prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-3",
                  "prose-li:text-gray-700 prose-li:my-1",
                  "prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium",
                  "prose-blockquote:border-l-4 prose-blockquote:border-teal-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600",
                  "prose-img:rounded-lg prose-img:shadow-md"
                )}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    code({ node, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeString = String(children).replace(/\n$/, '');
                      const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;
                      const inline = !className;
                      
                      if (!inline && match) {
                        return (
                          <div className="relative group/code">
                            <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-xl border-b border-gray-700">
                              <span className="text-xs font-mono text-gray-400 uppercase">
                                {match[1]}
                              </span>
                              <button
                                onClick={() => handleCopyCode(codeString, codeId)}
                                className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded transition-colors duration-150"
                              >
                                {copiedCode === codeId ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="!mt-0 !rounded-t-none">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          </div>
                        );
                      }
                      
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {content}
                </ReactMarkdown>
                {isStreaming && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 0.8,
                      ease: "easeInOut"
                    }}
                    className="inline-block w-1 h-4 ml-1 bg-gray-900 rounded"
                  />
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Timestamp - shown on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className={cn(
            "text-xs text-gray-400 mt-1 px-2",
            isUser && "text-right"
          )}
        >
          {formatMessageTime(new Date().toISOString())}
        </motion.div>
      </div>
    </motion.div>
  );
}

export function LoadingMessage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-4 py-6 px-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.2 }}
      >
        <Avatar className="h-9 w-9 bg-gray-800 ring-2 ring-gray-200 ring-offset-2">
          <div className="flex h-full items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
        </Avatar>
      </motion.div>
      
      <Card className="px-6 py-4 bg-white border-gray-200 shadow-md rounded-2xl">
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{
                y: [0, -8, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
