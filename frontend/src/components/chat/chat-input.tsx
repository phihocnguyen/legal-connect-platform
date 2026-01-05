import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { SendHorizonal, Loader2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const placeholders = [
    "Hỏi về luật lao động...",
    "Hỏi về quyền và nghĩa vụ công dân...",
    "Hỏi về luật hôn nhân và gia đình...",
    "Hỏi về luật doanh nghiệp...",
    "Hỏi về luật đất đai...",
    "Hỏi về thủ tục hành chính...",
  ];
  
  const [placeholder, setPlaceholder] = useState(placeholders[0]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Rotating placeholder animation
  useEffect(() => {
    if (disabled || message) return;
    
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [disabled, message]);

  useEffect(() => {
    setPlaceholder(placeholders[placeholderIndex]);
  }, [placeholderIndex]);

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    
    textareaRef.current.style.height = "auto";
    const scrollHeight = textareaRef.current.scrollHeight;
    const maxHeight = 200; // max-height in pixels
    
    textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
  }, [message]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
      
      // Reset height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      
      // Refocus after sending
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift) - let form handle the submit
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Don't call handleSubmit here - it will be called by form onSubmit
      // This prevents double submission
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
      return;
    }
    
    // Clear on Cmd/Ctrl + K
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setMessage("");
    }
  };

  const charCount = message.length;
  const showCharCount = charCount > 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={cn(
          "p-4 bg-white border transition-all duration-200",
          isFocused 
            ? "border-teal-500 shadow-lg shadow-teal-500/10" 
            : "border-gray-200 shadow-md",
          "rounded-2xl"
        )}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex items-end gap-3">
            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                placeholder={disabled ? "Đang xử lý..." : placeholder}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={disabled}
                rows={1}
                className={cn(
                  "w-full resize-none",
                  "bg-transparent",
                  "px-4 py-3",
                  "text-gray-900 text-base leading-relaxed",
                  "placeholder:text-gray-400",
                  "focus:outline-none",
                  "transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "max-h-[200px] overflow-y-auto",
                  "chat-custom-scrollbar"
                )}
                style={{
                  minHeight: "48px",
                }}
              />
              
              {/* Character count */}
              <AnimatePresence>
                {showCharCount && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute bottom-1 right-2 text-xs text-gray-400 bg-white px-2 py-0.5 rounded"
                  >
                    {charCount}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Send Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="submit"
                size="icon"
                disabled={!message.trim() || disabled}
                className={cn(
                  "h-12 w-12 rounded-xl",
                  "bg-teal-600",
                  "text-white shadow-lg",
                  "hover:bg-teal-700 hover:shadow-xl",
                  "disabled:bg-gray-300 disabled:shadow-none",
                  "disabled:cursor-not-allowed",
                  "transition-all duration-200",
                  "flex items-center justify-center"
                )}
                aria-label="Gửi tin nhắn"
              >
                <AnimatePresence mode="wait">
                  {disabled ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, rotate: -180 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 180 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="send"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SendHorizonal className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>

          {/* Hints */}
          <div className="flex items-center justify-between text-xs text-gray-400 px-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono">
                  Enter
                </kbd>
                <span>gửi</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono">
                  Shift + Enter
                </kbd>
                <span>xuống dòng</span>
              </span>
            </div>
            
            {message.trim() && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-teal-600 font-medium"
              >
                Sẵn sàng gửi
              </motion.span>
            )}
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
