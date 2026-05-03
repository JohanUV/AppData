'use client';

import { NextIntlClientProvider } from 'next-intl';
import { useEffect, useMemo } from 'react';
import { usePreferences } from '@/stores/preferences-store';
import { getMessages } from './messages';
import { defaultLocale } from './config';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const locale = usePreferences((s) => s.locale);
  const hydrated = usePreferences((s) => s.hydrated);

  // Hasta que el store hidrate, usar locale por defecto para evitar flicker raro.
  const activeLocale = hydrated ? locale : defaultLocale;
  const messages = useMemo(() => getMessages(activeLocale), [activeLocale]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = activeLocale;
    }
  }, [activeLocale]);

  return (
    <NextIntlClientProvider locale={activeLocale} messages={messages} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  );
}
