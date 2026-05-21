import dayjs from 'dayjs';

export function formatDate(date: string | Date, template = 'YYYY-MM-DD'): string {
  return dayjs(date).format(template);
}

export function formatDateTime(date: string | Date, template = 'YYYY-MM-DD HH:mm:ss'): string {
  return dayjs(date).format(template);
}

export function formatRelativeTime(date: string | Date): string {
  const now = dayjs();
  const target = dayjs(date);
  const diffMinutes = now.diff(target, 'minute');

  if (diffMinutes < 1) return '刚刚';
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  const diffHours = now.diff(target, 'hour');
  if (diffHours < 24) return `${diffHours}小时前`;
  const diffDays = now.diff(target, 'day');
  if (diffDays < 30) return `${diffDays}天前`;
  return target.format('YYYY-MM-DD');
}
