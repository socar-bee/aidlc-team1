import './globals.css';
import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import { Providers } from '@/lib/providers';

export const metadata: Metadata = {
  title: '테이블오더',
  description: '테이블에서 바로 주문하세요',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
