import type { ComponentType } from 'react';
import type { MDXComponents } from 'mdx/types';
import type { Locale } from '@/lib/i18n/config';
import type { Translations } from '@/lib/db/schema';

type MDXContent = ComponentType<{ components?: MDXComponents }>;

// ──────────────────────────────────────────────────────────────────────
// Imports estáticos por locale. El router pre-renderiza cada slug y carga
// la variante correspondiente en runtime según la preferencia del usuario.
// ──────────────────────────────────────────────────────────────────────
import IntroEs from './intro/what-is-data-engineering.mdx';
import IntroEn from './intro/what-is-data-engineering.en.mdx';
import IntroPt from './intro/what-is-data-engineering.pt.mdx';

export interface LessonMeta {
  slug: string;
  module: string;
  course: string;
  order: number;
  xpReward: number;
  estimatedMinutes: number;
  prerequisites: string[];
  title: Translations;
  description: Translations;
  type: 'theory' | 'exercise' | 'quiz' | 'project';
}

export interface LessonEntry {
  meta: LessonMeta;
  components: Record<Locale, MDXContent>;
}

const lessons: Record<string, LessonEntry> = {
  'what-is-data-engineering': {
    meta: {
      slug: 'what-is-data-engineering',
      module: 'intro',
      course: 'data-engineering',
      order: 1,
      xpReward: 100,
      estimatedMinutes: 15,
      prerequisites: [],
      type: 'theory',
      title: {
        es: '¿Qué es Data Engineering?',
        en: 'What is Data Engineering?',
        pt: 'O que é Data Engineering?',
      },
      description: {
        es: 'Visión general del rol, el ciclo de vida del dato y el stack moderno.',
        en: 'Overview of the role, the data lifecycle and the modern stack.',
        pt: 'Visão geral do papel, do ciclo de vida do dado e da stack moderna.',
      },
    },
    components: {
      es: IntroEs as MDXContent,
      en: IntroEn as MDXContent,
      pt: IntroPt as MDXContent,
    },
  },
};

export const lessonOrder = ['what-is-data-engineering'] as const;
export type LessonSlug = (typeof lessonOrder)[number];

export function getLesson(slug: string): LessonEntry | null {
  return lessons[slug] ?? null;
}

export function getAllLessonSlugs(): string[] {
  return Object.keys(lessons);
}

export function getNextLesson(slug: string): LessonEntry | null {
  const idx = lessonOrder.indexOf(slug as LessonSlug);
  if (idx === -1 || idx === lessonOrder.length - 1) return null;
  return getLesson(lessonOrder[idx + 1]!);
}

export function getPrevLesson(slug: string): LessonEntry | null {
  const idx = lessonOrder.indexOf(slug as LessonSlug);
  if (idx <= 0) return null;
  return getLesson(lessonOrder[idx - 1]!);
}

export function getLessonsByModule(moduleSlug: string): LessonEntry[] {
  return Object.values(lessons).filter((l) => l.meta.module === moduleSlug);
}
