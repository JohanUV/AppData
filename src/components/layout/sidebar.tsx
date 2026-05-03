'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Database,
  Home,
  LineChart,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { usePreferences } from '@/stores/preferences-store';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  labelKey: 'home' | 'courses' | 'practice' | 'achievements' | 'stats' | 'settings';
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: '/', labelKey: 'home', icon: Home },
  { href: '/courses', labelKey: 'courses', icon: BookOpen },
  { href: '/practice', labelKey: 'practice', icon: Sparkles },
  { href: '/achievements', labelKey: 'achievements', icon: Trophy },
  { href: '/stats', labelKey: 'stats', icon: LineChart },
  { href: '/settings', labelKey: 'settings', icon: Settings },
];

export function Sidebar() {
  const collapsed = usePreferences((s) => s.sidebarCollapsed);
  const toggle = usePreferences((s) => s.toggleSidebar);
  const pathname = usePathname();
  const t = useTranslations('common');

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 280, damping: 32 }}
      className="flex h-full flex-col border-r border-border bg-card/50 backdrop-blur"
    >
      <div className="flex h-14 items-center gap-3 border-b border-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
          <Database className="h-4 w-4" />
        </div>
        {!collapsed && (
          <span className="truncate font-semibold tracking-tight">{t('app.name')}</span>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                collapsed && 'justify-center px-2',
              )}
              title={collapsed ? t(`nav.${item.labelKey}`) : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <span className="truncate">{t(`nav.${item.labelKey}`)}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'sm'}
          onClick={toggle}
          className={cn('w-full', !collapsed && 'justify-start')}
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span className="ml-2 text-xs">Colapsar</span>
            </>
          )}
        </Button>
      </div>
    </motion.aside>
  );
}
