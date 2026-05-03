'use client';

import { Check, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { locales, localeMeta } from '@/lib/i18n/config';
import { usePreferences } from '@/stores/preferences-store';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  variant?: 'icon' | 'full';
}

export function LanguageSelector({ variant = 'icon' }: LanguageSelectorProps) {
  const locale = usePreferences((s) => s.locale);
  const setLocale = usePreferences((s) => s.setLocale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={variant === 'icon' ? 'icon' : 'default'}
          aria-label="Seleccionar idioma"
        >
          <Globe className="h-4 w-4" />
          {variant === 'full' && (
            <span className="ml-2 uppercase">{locale}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Idioma</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {locales.map((l) => {
          const meta = localeMeta[l];
          const active = l === locale;
          return (
            <DropdownMenuItem
              key={l}
              onSelect={() => setLocale(l)}
              className="flex items-center gap-3"
            >
              <span aria-hidden className="text-lg">
                {meta.flag}
              </span>
              <span className="flex-1 text-sm">{meta.label}</span>
              <Check className={cn('h-4 w-4', active ? 'opacity-100' : 'opacity-0')} />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
