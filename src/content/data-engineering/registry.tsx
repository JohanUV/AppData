import type { ComponentType } from 'react';
import type { MDXComponents } from 'mdx/types';
import type { Locale } from '@/lib/i18n/config';
import type { Translations } from '@/lib/db/schema';
import { LessonStub } from '@/components/content/lesson-stub';
import { lessonMetadata, type LessonMetaEntry } from './lessons-meta';
import { moduleOrder } from './modules';

type MDXContent = ComponentType<{ components?: MDXComponents }>;

// ──────────────────────────────────────────────────────────────────────
// Imports estáticos por locale.
// Sólo importamos las lecciones realmente escritas. El resto cae a stub.
// ──────────────────────────────────────────────────────────────────────
import IntroEs from './intro/what-is-data-engineering.mdx';
import IntroEn from './intro/what-is-data-engineering.en.mdx';
import IntroPt from './intro/what-is-data-engineering.pt.mdx';

// Módulo git
import GitWhatEs from './git/git-what-and-why.mdx';
import GitWhatEn from './git/git-what-and-why.en.mdx';
import GitWhatPt from './git/git-what-and-why.pt.mdx';
import GitInstallEs from './git/git-install-config.mdx';
import GitInstallEn from './git/git-install-config.en.mdx';
import GitInstallPt from './git/git-install-config.pt.mdx';
import GitFirstEs from './git/git-first-repo.mdx';
import GitFirstEn from './git/git-first-repo.en.mdx';
import GitFirstPt from './git/git-first-repo.pt.mdx';
import GitEssEs from './git/git-essentials.mdx';
import GitEssEn from './git/git-essentials.en.mdx';
import GitEssPt from './git/git-essentials.pt.mdx';
import GitBranchesEs from './git/git-branches-merge.mdx';
import GitBranchesEn from './git/git-branches-merge.en.mdx';
import GitBranchesPt from './git/git-branches-merge.pt.mdx';
import GitRemoteEs from './git/git-remote-github.mdx';
import GitRemoteEn from './git/git-remote-github.en.mdx';
import GitRemotePt from './git/git-remote-github.pt.mdx';
import GitPrEs from './git/git-pull-requests.mdx';
import GitPrEn from './git/git-pull-requests.en.mdx';
import GitPrPt from './git/git-pull-requests.pt.mdx';
import GitBpEs from './git/git-best-practices.mdx';
import GitBpEn from './git/git-best-practices.en.mdx';
import GitBpPt from './git/git-best-practices.pt.mdx';

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
  isStub: boolean;
}

// ──────────────────────────────────────────────────────────────────────
// Mapa de componentes MDX reales por slug.
// Lo que NO esté aquí cae a LessonStub.
// ──────────────────────────────────────────────────────────────────────
const realComponents: Record<string, Record<Locale, MDXContent>> = {
  'what-is-data-engineering': {
    es: IntroEs as MDXContent,
    en: IntroEn as MDXContent,
    pt: IntroPt as MDXContent,
  },
  'git-what-and-why': {
    es: GitWhatEs as MDXContent,
    en: GitWhatEn as MDXContent,
    pt: GitWhatPt as MDXContent,
  },
  'git-install-config': {
    es: GitInstallEs as MDXContent,
    en: GitInstallEn as MDXContent,
    pt: GitInstallPt as MDXContent,
  },
  'git-first-repo': {
    es: GitFirstEs as MDXContent,
    en: GitFirstEn as MDXContent,
    pt: GitFirstPt as MDXContent,
  },
  'git-essentials': {
    es: GitEssEs as MDXContent,
    en: GitEssEn as MDXContent,
    pt: GitEssPt as MDXContent,
  },
  'git-branches-merge': {
    es: GitBranchesEs as MDXContent,
    en: GitBranchesEn as MDXContent,
    pt: GitBranchesPt as MDXContent,
  },
  'git-remote-github': {
    es: GitRemoteEs as MDXContent,
    en: GitRemoteEn as MDXContent,
    pt: GitRemotePt as MDXContent,
  },
  'git-pull-requests': {
    es: GitPrEs as MDXContent,
    en: GitPrEn as MDXContent,
    pt: GitPrPt as MDXContent,
  },
  'git-best-practices': {
    es: GitBpEs as MDXContent,
    en: GitBpEn as MDXContent,
    pt: GitBpPt as MDXContent,
  },
};

// ──────────────────────────────────────────────────────────────────────
// Componentes stub (uno por locale) — mismo placeholder con copy traducido.
// ──────────────────────────────────────────────────────────────────────
const StubEs: MDXContent = function () {
  return <LessonStub locale="es" />;
};
const StubEn: MDXContent = function () {
  return <LessonStub locale="en" />;
};
const StubPt: MDXContent = function () {
  return <LessonStub locale="pt" />;
};
const stubComponents: Record<Locale, MDXContent> = { es: StubEs, en: StubEn, pt: StubPt };

// ──────────────────────────────────────────────────────────────────────
// Catálogo "intro" — la única lección que vivía en el registry original.
// Se materializa con el mismo shape que las del array lessonMetadata.
// ──────────────────────────────────────────────────────────────────────
const introMeta: LessonMetaEntry = {
  slug: 'what-is-data-engineering',
  module: 'intro',
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
};

// ──────────────────────────────────────────────────────────────────────
// Construcción del registry combinando metadata + componentes.
// ──────────────────────────────────────────────────────────────────────
function buildEntry(meta: LessonMetaEntry): LessonEntry {
  const real = realComponents[meta.slug];
  return {
    meta: {
      slug: meta.slug,
      module: meta.module,
      course: 'data-engineering',
      order: meta.order,
      xpReward: meta.xpReward,
      estimatedMinutes: meta.estimatedMinutes,
      prerequisites: meta.prerequisites,
      type: meta.type,
      title: meta.title,
      description: meta.description,
    },
    components: real ?? stubComponents,
    isStub: !real,
  };
}

const allMeta: LessonMetaEntry[] = [introMeta, ...lessonMetadata];
const lessons: Record<string, LessonEntry> = Object.fromEntries(
  allMeta.map((m) => [m.slug, buildEntry(m)]),
);

// Orden global respetando moduleOrder + order dentro del módulo.
const moduleIndex = new Map<string, number>(moduleOrder.map((m, i) => [m, i]));
export const lessonOrder: string[] = allMeta
  .slice()
  .sort((a, b) => {
    const mi = (moduleIndex.get(a.module) ?? 99) - (moduleIndex.get(b.module) ?? 99);
    if (mi !== 0) return mi;
    return a.order - b.order;
  })
  .map((m) => m.slug);

export type LessonSlug = string;

export function getLesson(slug: string): LessonEntry | null {
  return lessons[slug] ?? null;
}

export function getAllLessonSlugs(): string[] {
  return Object.keys(lessons);
}

export function getNextLesson(slug: string): LessonEntry | null {
  const idx = lessonOrder.indexOf(slug);
  if (idx === -1 || idx === lessonOrder.length - 1) return null;
  return getLesson(lessonOrder[idx + 1]!);
}

export function getPrevLesson(slug: string): LessonEntry | null {
  const idx = lessonOrder.indexOf(slug);
  if (idx <= 0) return null;
  return getLesson(lessonOrder[idx - 1]!);
}

export function getLessonsByModule(moduleSlug: string): LessonEntry[] {
  return Object.values(lessons)
    .filter((l) => l.meta.module === moduleSlug)
    .sort((a, b) => a.meta.order - b.meta.order);
}
