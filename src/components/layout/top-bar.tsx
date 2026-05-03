'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { ModeToggle } from '@/components/theme/mode-toggle';
import { ThemeSelector } from '@/components/theme/theme-selector';
import { LanguageSelector } from '@/components/i18n/language-selector';

export function TopBar() {
  const t = useTranslations('common');

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-card/40 px-4 backdrop-blur">
      <div className="relative max-w-xl flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t('nav.search')}
          className="pl-9"
          aria-label={t('nav.search')}
        />
      </div>
      <div className="flex items-center gap-2">
        <ThemeSelector />
        <ModeToggle />
        <LanguageSelector />
      </div>
    </header>
  );
}
