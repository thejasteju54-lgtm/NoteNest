/**
 * Formats bytes into human-readable strings (e.g. 2.4 MB, 450 KB).
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (!bytes || isNaN(bytes)) return 'Unknown size';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  if (i === 0) return `${bytes} B`;
  const val = bytes / Math.pow(k, i);
  return `${val.toFixed(val < 10 ? 1 : 0)} ${sizes[i]}`;
}

/**
 * Formats ISO date into human-friendly relative or calendar strings.
 * e.g., "Added today", "Added yesterday", "Added Aug 29, 2026"
 */
export function formatUploadDate(isoDateString: string): string {
  if (!isoDateString) return '';

  const date = new Date(isoDateString);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 2) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24 && date.getDate() === now.getDate()) return 'Added today';
  if (diffDays === 1 || (diffDays < 2 && date.getDate() === now.getDate() - 1)) return 'Added yesterday';
  if (diffDays < 7) return `Added ${diffDays} days ago`;

  return `Added ${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })}`;
}

/**
 * Generates an appropriate greeting based on local time of day.
 */
export function getTimeOfDayGreeting(name?: string): string {
  const hour = new Date().getHours();
  let timeGreeting = 'Good morning';

  if (hour >= 12 && hour < 17) {
    timeGreeting = 'Good afternoon';
  } else if (hour >= 17 || hour < 4) {
    timeGreeting = 'Good evening';
  }

  return name ? `${timeGreeting}, ${name}.` : `${timeGreeting}.`;
}

/**
 * Cleans user input note titles.
 */
export function sanitizeTitle(raw: string): string {
  return raw.replace(/[<>:"/\\|?*]/g, '').trim();
}
