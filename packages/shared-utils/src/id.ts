import { customAlphabet } from 'nanoid';

// We don't have nanoid as dependency yet — simple fallback
function shortId(prefix: string): string {
  const ts = Date.now().toString(36).slice(-6);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}${ts}${rand}`.toUpperCase();
}

export function generateOrderNo(): string {
  return shortId('ORD');
}

export function generateTaskNo(): string {
  return shortId('TSK');
}

export function generateId(prefix: string): string {
  return shortId(prefix);
}
