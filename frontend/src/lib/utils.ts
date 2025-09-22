import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseVietnameseDate(dateString: string): Date | null {
  if (!dateString) return null;
  
  // Handle format like "14/07/2017"
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  
  return new Date(dateString);
}

export function formatVietnameseDate(dateString: string): string {
  const date = parseVietnameseDate(dateString);
  return date?.toLocaleDateString('vi-VN') || dateString;
}
