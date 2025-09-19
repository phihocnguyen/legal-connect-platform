import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  textPosition?: "top" | "bottom" | "left" | "right";
  showText?: boolean;
}

export function LoadingSpinner({ 
  size = "md", 
  className, 
  text = "Đang tải...",
  textPosition = "bottom",
  showText = true
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  const spinner = (
    <div 
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-[#004646]",
        sizeClasses[size],
        className
      )}
    />
  );

  if (!showText) {
    return spinner;
  }

  const textClasses = cn(
    "text-[#004646]",
    size === "sm" && "text-xs",
    size === "md" && "text-sm",
    size === "lg" && "text-base"
  );

  const containerClasses = cn(
    "flex items-center justify-center",
    textPosition === "top" && "flex-col-reverse",
    textPosition === "bottom" && "flex-col",
    textPosition === "left" && "flex-row-reverse",
    textPosition === "right" && "flex-row"
  );

  const gapClasses = cn(
    textPosition === "top" || textPosition === "bottom" ? "mt-2 mb-2" : "ml-2 mr-2"
  );

  return (
    <div className={containerClasses}>
      {spinner}
      <span className={cn(textClasses, gapClasses)}>{text}</span>
    </div>
  );
}