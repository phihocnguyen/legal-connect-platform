'use client';

import { useLoading } from '@/contexts/loading-context';

export function GlobalLoadingIndicator() {
  const { loadingState } = useLoading();

  if (!loadingState.isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Scale of Justice */}
        <div className="relative w-32 h-32">
          {/* Outer pulsing ring */}
          <div className="absolute inset-0 rounded-full border-4 border-teal-200 animate-ping" />
          
          {/* Spinning ring */}
          <div className="absolute inset-0 rounded-full border-4 border-teal-400 border-t-transparent animate-spin" 
               style={{ animationDuration: '1.5s' }} />
          
          {/* Center icon - Scale of Justice */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-16 h-16 text-teal-600"
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

        {/* Loading text with fade animation */}
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-teal-700 animate-pulse">
            {loadingState.message || 'Đang tải...'}
          </p>
          <div className="flex gap-1 justify-center">
            <span className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}