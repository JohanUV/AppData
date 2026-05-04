'use client';

import { Info, Lightbulb, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type CalloutType = 'info' | 'warning' | 'tip' | 'success';

const styles: Record<CalloutType, { icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  info: {
    icon: Info,
    cls: 'border-info/30 bg-info/10 text-info',
  },
  warning: {
    icon: AlertTriangle,
    cls: 'border-warning/30 bg-warning/10 text-warning',
  },
  tip: {
    icon: Lightbulb,
    cls: 'border-primary/30 bg-primary/10 text-primary',
  },
  success: {
    icon: CheckCircle2,
    cls: 'border-success/30 bg-success/10 text-success',
  },
};

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const { icon: Icon, cls } = styles[type];
  return (
    <div className={cn('my-4 flex gap-3 rounded-lg border p-4', cls)}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1 space-y-1">
        {title && <div className="font-semibold">{title}</div>}
        <div className="text-sm leading-relaxed text-foreground/90">{children}</div>
      </div>
    </div>
  );
}
