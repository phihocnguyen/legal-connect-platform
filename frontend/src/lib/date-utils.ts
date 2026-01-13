/**
 * Date and time utility functions with Vietnam timezone support (UTC+7)
 */

const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Parse UTC timestamp and convert to Vietnam Date object
 * @param timestamp - ISO timestamp string from server (UTC)
 * @returns Date object
 */
export function parseUTCDate(timestamp: string): Date {
  // Ensure timestamp is treated as UTC by adding 'Z' if not present
  const utcTimestamp = timestamp.endsWith('Z') ? timestamp : timestamp + 'Z';
  return new Date(utcTimestamp);
}

/**
 * Format time for chat messages (HH:mm)
 * @param timestamp - ISO timestamp string
 * @returns Formatted time string (e.g., "14:30")
 */
export function formatMessageTime(timestamp: string): string {
  const date = parseUTCDate(timestamp);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: VIETNAM_TIMEZONE,
  });
}

/**
 * Format relative time for conversation list
 * @param timestamp - ISO timestamp string
 * @returns Relative time string (e.g., "Vừa xong", "2h", "3d", or formatted date)
 */
export function formatRelativeTime(timestamp: string): string {
  const date = parseUTCDate(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Vừa xong';
  if (diffInHours < 24) return `${diffInHours}h`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
  
  return date.toLocaleDateString('vi-VN', { 
    timeZone: VIETNAM_TIMEZONE 
  });
}

/**
 * Format full date and time
 * @param timestamp - ISO timestamp string
 * @returns Formatted date and time string (e.g., "13/01/2026 14:30")
 */
export function formatFullDateTime(timestamp: string): string {
  const date = parseUTCDate(timestamp);
  return date.toLocaleString('vi-VN', {
    timeZone: VIETNAM_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date only
 * @param timestamp - ISO timestamp string
 * @returns Formatted date string (e.g., "13/01/2026")
 */
export function formatDate(timestamp: string): string {
  const date = parseUTCDate(timestamp);
  return date.toLocaleDateString('vi-VN', {
    timeZone: VIETNAM_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Check if a timestamp is today
 * @param timestamp - ISO timestamp string
 * @returns true if the date is today
 */
export function isToday(timestamp: string): boolean {
  const date = parseUTCDate(timestamp);
  const today = new Date();
  
  const dateStr = date.toLocaleDateString('vi-VN', { timeZone: VIETNAM_TIMEZONE });
  const todayStr = today.toLocaleDateString('vi-VN', { timeZone: VIETNAM_TIMEZONE });
  
  return dateStr === todayStr;
}

/**
 * Get time ago string (e.g., "2 phút trước", "1 giờ trước")
 * @param timestamp - ISO timestamp string
 * @returns Human-readable time ago string
 */
export function getTimeAgo(timestamp: string): string {
  const date = parseUTCDate(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Vừa xong';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ngày trước`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} tuần trước`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} tháng trước`;
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} năm trước`;
}
