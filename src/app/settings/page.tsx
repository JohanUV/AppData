'use client';

import { Bot, Languages, Moon, Palette, Sun, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { themeOrder, themes } from '@/lib/themes/themes';
import { locales, localeMeta } from '@/lib/i18n/config';
import { usePreferences } from '@/stores/preferences-store';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const tc = useTranslations('common');
  const { themeId, mode, locale, setTheme, setMode, setLocale } = usePreferences();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 p-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </header>

      {/* Apariencia */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <CardTitle>{t('sections.appearance.title')}</CardTitle>
          </div>
          <CardDescription>{t('sections.appearance.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="mb-3 text-sm font-medium">{t('sections.appearance.themeLabel')}</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {themeOrder.map((id) => {
                const theme = themes[id];
                const active = id === themeId;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTheme(id)}
                    aria-pressed={active}
                    className={cn(
                      'group flex flex-col items-start gap-3 rounded-lg border p-3 text-left transition-all',
                      active
                        ? 'border-primary ring-2 ring-primary/40'
                        : 'border-border hover:border-primary/40 hover:bg-accent',
                    )}
                  >
                    <div className="flex w-full gap-1">
                      <span
                        aria-hidden
                        className="h-10 flex-1 rounded-md ring-1 ring-border"
                        style={{ background: theme.preview.light }}
                      />
                      <span
                        aria-hidden
                        className="h-10 flex-1 rounded-md ring-1 ring-border"
                        style={{ background: theme.preview.dark }}
                      />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">{theme.name}</div>
                      <div className="line-clamp-2 text-xs text-muted-foreground">
                        {theme.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-3 text-sm font-medium">{t('sections.appearance.modeLabel')}</div>
            <div className="inline-flex rounded-md border border-border bg-card p-1">
              <Button
                variant={mode === 'light' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('light')}
              >
                <Sun className="h-4 w-4" />
                <span className="ml-2">{t('sections.appearance.modeLight')}</span>
              </Button>
              <Button
                variant={mode === 'dark' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('dark')}
              >
                <Moon className="h-4 w-4" />
                <span className="ml-2">{t('sections.appearance.modeDark')}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Idioma */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-primary" />
            <CardTitle>{t('sections.language.title')}</CardTitle>
          </div>
          <CardDescription>{t('sections.language.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-3 text-sm font-medium">{t('sections.language.label')}</div>
          <div className="grid gap-2 sm:grid-cols-3">
            {locales.map((l) => {
              const meta = localeMeta[l];
              const active = l === locale;
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLocale(l)}
                  aria-pressed={active}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                    active
                      ? 'border-primary ring-2 ring-primary/40'
                      : 'border-border hover:border-primary/40 hover:bg-accent',
                  )}
                >
                  <span aria-hidden className="text-2xl">
                    {meta.flag}
                  </span>
                  <div>
                    <div className="text-sm font-medium">{meta.label}</div>
                    <div className="text-xs uppercase text-muted-foreground">{l}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cuenta (placeholder) */}
      <Card className="opacity-80">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <CardTitle>{t('sections.account.title')}</CardTitle>
            <Badge variant="secondary" className="ml-auto">
              {tc('actions.continue')}…
            </Badge>
          </div>
          <CardDescription>{t('sections.account.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            {t('sections.account.placeholder')}
          </div>
        </CardContent>
      </Card>

      {/* Tutor IA (placeholder) */}
      <Card className="opacity-80">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <CardTitle>{t('sections.ai.title')}</CardTitle>
            <Badge variant="secondary" className="ml-auto">
              {tc('actions.continue')}…
            </Badge>
          </div>
          <CardDescription>{t('sections.ai.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            {t('sections.ai.placeholder')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
