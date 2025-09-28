import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./loading-spinner";

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  overlay?: boolean; // Full overlay or inline
  priority?: "high" | "medium" | "low"; // Loading priority
}

export function LoadingOverlay({ 
  isLoading,
  children, 
  size = "md", 
  text = "Đang tải...",
  className,
  overlay = true,
  priority = "medium"
}: LoadingOverlayProps) {
  const overlayClasses = cn(
    "relative",
    className
  );

  const loadingClasses = cn(
    "flex items-center justify-center",
    overlay && "absolute inset-0 bg-white/80 backdrop-blur-sm",
    !overlay && "py-8",
    // Z-index based on priority
    priority === "high" && "z-50",
    priority === "medium" && "z-30", 
    priority === "low" && "z-10"
  );

  return (
    <div className={overlayClasses}>
      {children}
      {isLoading && (
        <div className={loadingClasses}>
          <LoadingSpinner size={size} text={text} />
        </div>
      )}
    </div>
  );
}