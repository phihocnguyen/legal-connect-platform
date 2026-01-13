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
    sm: "h-12 w-12",
    md: "h-20 w-20", 
    lg: "h-32 w-32"
  };

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16"
  };

  const spinner = (
    <div className={cn("relative", sizeClasses[size], className)}>
      {/* Outer pulsing ring */}
      <div className="absolute inset-0 rounded-full border-4 border-teal-200 animate-ping" />
      
      {/* Spinning ring */}
      <div className="absolute inset-0 rounded-full border-4 border-teal-400 border-t-transparent animate-spin" 
           style={{ animationDuration: '1.5s' }} />
      
      {/* Center icon - Scale of Justice */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className={cn("text-teal-600", iconSizes[size])}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Central pole */}
          <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          
          {/* Base */}
          <line x1="8" y1="20" x2="16" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          
          {/* Top horizontal beam */}
          <line x1="6" y1="8" x2="18" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          
          {/* Left scale */}
          <circle cx="7" cy="8" r="1" fill="currentColor"/>
          <line x1="7" y1="9" x2="7" y2="11" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 11 L7 14 L9 11 Z" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1"/>
          
          {/* Right scale */}
          <circle cx="17" cy="8" r="1" fill="currentColor"/>
          <line x1="17" y1="9" x2="17" y2="11" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M15 11 L17 14 L19 11 Z" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1"/>
        </svg>
      </div>
    </div>
  );

  if (!showText) {
    return spinner;
  }

  const textClasses = cn(
    "text-teal-700 font-medium",
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