import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, pattern = 'MMMM d, yyyy') {
  return format(new Date(date), pattern);
}

export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length: number) {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + '…';
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'ongoing':   return 'badge-gold';
    case 'completed': return 'badge-mist';
    case 'upcoming':  return 'badge-rose';
    case 'hiatus':    return 'badge-mist';
    default:          return 'badge-mist';
  }
}

export function getStatusLabel(status: string) {
  switch (status) {
    case 'ongoing':   return 'Ongoing';
    case 'completed': return 'Completed';
    case 'upcoming':  return 'Coming Soon';
    case 'hiatus':    return 'On Hiatus';
    default:          return status;
  }
}

export function formatWordCount(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k words`;
  return `${count} words`;
}

export function getCountdown(dateStr: string) {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}
