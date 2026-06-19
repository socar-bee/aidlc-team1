'use client';

import { useMutation } from '@tanstack/react-query';
import type { UploadImageResponse } from '@table-order/shared-types';
import { useAuthStore } from '@/stores/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function useUploadImage() {
  return useMutation<UploadImageResponse, Error, File>({
    mutationFn: async (file) => {
      const fd = new FormData();
      fd.append('file', file);
      const token = useAuthStore.getState().token;
      const res = await fetch(`${API_URL}/images/upload`, {
        method: 'POST',
        body: fd,
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        let msg = '이미지 업로드 실패';
        try {
          const body = (await res.json()) as { error?: { message?: string } };
          msg = body.error?.message ?? msg;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }
      return (await res.json()) as UploadImageResponse;
    },
  });
}

export function toAbsoluteImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_URL}${url}`;
}
