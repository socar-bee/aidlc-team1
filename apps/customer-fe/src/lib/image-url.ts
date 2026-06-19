const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function toAbsoluteImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_URL}${url}`;
}
