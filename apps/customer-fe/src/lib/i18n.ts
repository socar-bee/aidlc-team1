import { getRequestConfig } from 'next-intl/server';

export const DEFAULT_LOCALE = 'ko' as const;
export const SUPPORTED_LOCALES = ['ko'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export default getRequestConfig(async () => ({
  locale: DEFAULT_LOCALE,
  messages: (await import(`../../messages/${DEFAULT_LOCALE}.json`)).default,
  timeZone: 'Asia/Seoul',
}));
