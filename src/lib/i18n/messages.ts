import type { Locale } from './config';

import esCommon from '@/content/translations/es/common.json';
import esLessons from '@/content/translations/es/lessons.json';
import esSettings from '@/content/translations/es/settings.json';
import enCommon from '@/content/translations/en/common.json';
import enLessons from '@/content/translations/en/lessons.json';
import enSettings from '@/content/translations/en/settings.json';
import ptCommon from '@/content/translations/pt/common.json';
import ptLessons from '@/content/translations/pt/lessons.json';
import ptSettings from '@/content/translations/pt/settings.json';

// Mensajes empaquetados estáticamente (export estático no permite carga dinámica del filesystem).
const messagesByLocale = {
  es: { common: esCommon, lessons: esLessons, settings: esSettings },
  en: { common: enCommon, lessons: enLessons, settings: enSettings },
  pt: { common: ptCommon, lessons: ptLessons, settings: ptSettings },
} as const;

export type Messages = (typeof messagesByLocale)[Locale];

export function getMessages(locale: Locale): Messages {
  return messagesByLocale[locale];
}
