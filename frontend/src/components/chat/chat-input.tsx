import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { SendHorizonal } from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };


  return (
    <Card className="p-4 bg-white shadow-md border border-gray-200 rounded-xl">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <Input
          placeholder="Nhập câu hỏi của bạn..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="
            flex-1
            bg-gray-50
            border
            border-gray-300
            rounded-xl
            px-4
            py-6
            text-gray-900
            placeholder:text-gray-400
            focus:outline-none
            focus:border-transparent
            transition
            duration-200
            ease-in-out
          "
          disabled={disabled}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || disabled}
          className="
            h-10
            w-10
            rounded-xl
            bg-teal-600
            text-white
            hover:bg-teal-700
            disabled:bg-teal-300
            disabled:cursor-not-allowed
            flex
            items-center
            justify-center
            transition
            duration-150
            ease-in-out
          "
          aria-label="Gửi tin nhắn"
        >
          <SendHorizonal className="h-5 w-5" />
        </Button>
      </form>
    </Card>
  );
}
