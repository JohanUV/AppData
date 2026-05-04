'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { BadgeRow } from '@/types/datapath-api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { BadgeIcon } from './badge-icon';
import { usePreferences } from '@/stores/preferences-store';

interface BadgeUnlockModalProps {
  badge: BadgeRow | null;
  onClose: () => void;
}

export function BadgeUnlockModal({ badge, onClose }: BadgeUnlockModalProps) {
  const locale = usePreferences((s) => s.locale);

  useEffect(() => {
    if (!badge) return;
    // Confetti suave: dos disparos desde laterales, sin gritar visualmente.
    const colors = ['#fbbf24', '#a78bfa', '#34d399', '#60a5fa'];
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
      ticks: 200,
    });
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
      ticks: 200,
    });
  }, [badge]);

  return (
    <Dialog open={badge !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md text-center">
        <AnimatePresence>
          {badge && (
            <motion.div
              key={badge.id}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              className="flex flex-col items-center gap-4 py-4"
            >
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                ¡Logro desbloqueado!
              </div>
              <BadgeIcon icon={badge.icon} tier={badge.tier} earned size="lg" />
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">
                  {badge.nameTranslations[locale]}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {badge.descriptionTranslations[locale]}
                </p>
              </div>
              <Button onClick={onClose} className="mt-2">
                ¡Genial!
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
