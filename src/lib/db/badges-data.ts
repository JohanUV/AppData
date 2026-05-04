import type { BadgeCriteria, Translations } from './schema';

export interface BadgeSeed {
  slug: string;
  icon: string; // nombre de Lucide icon
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  name: Translations;
  description: Translations;
  criteria: BadgeCriteria;
}

export const badgeSeeds: BadgeSeed[] = [
  // Hitos de progreso
  {
    slug: 'first-step',
    icon: 'Footprints',
    tier: 'bronze',
    name: { es: 'Primer paso', en: 'First step', pt: 'Primeiro passo' },
    description: {
      es: 'Completa tu primera lección.',
      en: 'Complete your first lesson.',
      pt: 'Complete sua primeira lição.',
    },
    criteria: { type: 'first_lesson' },
  },
  {
    slug: 'ten-lessons',
    icon: 'BookOpen',
    tier: 'bronze',
    name: { es: 'Estudiante aplicado', en: 'Applied student', pt: 'Estudante aplicado' },
    description: {
      es: 'Completa 10 lecciones.',
      en: 'Complete 10 lessons.',
      pt: 'Complete 10 lições.',
    },
    criteria: { type: 'lessons_count', count: 10 },
  },
  {
    slug: 'fifty-lessons',
    icon: 'BookOpenCheck',
    tier: 'silver',
    name: { es: 'Veterano', en: 'Veteran', pt: 'Veterano' },
    description: {
      es: 'Completa 50 lecciones.',
      en: 'Complete 50 lessons.',
      pt: 'Complete 50 lições.',
    },
    criteria: { type: 'lessons_count', count: 50 },
  },
  {
    slug: 'hundred-lessons',
    icon: 'GraduationCap',
    tier: 'gold',
    name: { es: 'Centurión', en: 'Centurion', pt: 'Centurião' },
    description: {
      es: 'Completa 100 lecciones.',
      en: 'Complete 100 lessons.',
      pt: 'Complete 100 lições.',
    },
    criteria: { type: 'lessons_count', count: 100 },
  },

  // Horarios
  {
    slug: 'early-bird',
    icon: 'Sunrise',
    tier: 'silver',
    name: { es: 'Madrugador', en: 'Early bird', pt: 'Madrugador' },
    description: {
      es: 'Completa una lección antes de las 7 AM.',
      en: 'Complete a lesson before 7 AM.',
      pt: 'Complete uma lição antes das 7h.',
    },
    criteria: { type: 'time_of_day', before: 7 },
  },
  {
    slug: 'night-owl',
    icon: 'Moon',
    tier: 'silver',
    name: { es: 'Noctámbulo', en: 'Night owl', pt: 'Notívago' },
    description: {
      es: 'Completa una lección después de las 11 PM.',
      en: 'Complete a lesson after 11 PM.',
      pt: 'Complete uma lição depois das 23h.',
    },
    criteria: { type: 'time_of_day', after: 23 },
  },
  {
    slug: 'marathon',
    icon: 'Timer',
    tier: 'gold',
    name: { es: 'Maratonista', en: 'Marathoner', pt: 'Maratonista' },
    description: {
      es: 'Estudia 2+ horas en un solo día.',
      en: 'Study 2+ hours in a single day.',
      pt: 'Estude 2+ horas em um único dia.',
    },
    criteria: { type: 'marathon', minutes: 120 },
  },

  // Rachas
  {
    slug: 'consistent-7',
    icon: 'Flame',
    tier: 'silver',
    name: { es: 'Constancia', en: 'Consistency', pt: 'Constância' },
    description: { es: 'Racha de 7 días.', en: '7-day streak.', pt: 'Sequência de 7 dias.' },
    criteria: { type: 'streak', days: 7 },
  },
  {
    slug: 'unstoppable-30',
    icon: 'Flame',
    tier: 'gold',
    name: { es: 'Imparable', en: 'Unstoppable', pt: 'Imparável' },
    description: { es: 'Racha de 30 días.', en: '30-day streak.', pt: 'Sequência de 30 dias.' },
    criteria: { type: 'streak', days: 30 },
  },
  {
    slug: 'dedicated-100',
    icon: 'Flame',
    tier: 'platinum',
    name: { es: 'Dedicado', en: 'Dedicated', pt: 'Dedicado' },
    description: { es: 'Racha de 100 días.', en: '100-day streak.', pt: 'Sequência de 100 dias.' },
    criteria: { type: 'streak', days: 100 },
  },

  // XP totales
  {
    slug: 'xp-1000',
    icon: 'Sparkles',
    tier: 'bronze',
    name: { es: 'Mil XP', en: 'A thousand XP', pt: 'Mil XP' },
    description: { es: 'Acumula 1.000 XP.', en: 'Earn 1,000 XP.', pt: 'Acumule 1.000 XP.' },
    criteria: { type: 'total_xp', xp: 1000 },
  },
  {
    slug: 'xp-10000',
    icon: 'Sparkles',
    tier: 'silver',
    name: { es: 'Diez mil XP', en: 'Ten thousand XP', pt: 'Dez mil XP' },
    description: { es: 'Acumula 10.000 XP.', en: 'Earn 10,000 XP.', pt: 'Acumule 10.000 XP.' },
    criteria: { type: 'total_xp', xp: 10000 },
  },
  {
    slug: 'xp-50000',
    icon: 'Crown',
    tier: 'platinum',
    name: { es: 'Leyenda', en: 'Legend', pt: 'Lenda' },
    description: { es: 'Acumula 50.000 XP.', en: 'Earn 50,000 XP.', pt: 'Acumule 50.000 XP.' },
    criteria: { type: 'total_xp', xp: 50000 },
  },

  // Niveles
  {
    slug: 'level-10',
    icon: 'Award',
    tier: 'bronze',
    name: { es: 'Practicante', en: 'Practitioner', pt: 'Praticante' },
    description: { es: 'Alcanza el nivel 10.', en: 'Reach level 10.', pt: 'Alcance o nível 10.' },
    criteria: { type: 'level', level: 10 },
  },
  {
    slug: 'level-25',
    icon: 'Award',
    tier: 'silver',
    name: { es: 'Experto', en: 'Expert', pt: 'Expert' },
    description: { es: 'Alcanza el nivel 25.', en: 'Reach level 25.', pt: 'Alcance o nível 25.' },
    criteria: { type: 'level', level: 25 },
  },
  {
    slug: 'level-50',
    icon: 'Trophy',
    tier: 'gold',
    name: { es: 'Maestro', en: 'Master', pt: 'Mestre' },
    description: { es: 'Alcanza el nivel 50.', en: 'Reach level 50.', pt: 'Alcance o nível 50.' },
    criteria: { type: 'level', level: 50 },
  },
  {
    slug: 'level-100',
    icon: 'Crown',
    tier: 'platinum',
    name: { es: 'Iluminado', en: 'Enlightened', pt: 'Iluminado' },
    description: { es: 'Alcanza el nivel 100.', en: 'Reach level 100.', pt: 'Alcance o nível 100.' },
    criteria: { type: 'level', level: 100 },
  },

  // Módulos completos
  {
    slug: 'sql-master',
    icon: 'Database',
    tier: 'gold',
    name: { es: 'Maestro SQL', en: 'SQL Master', pt: 'Mestre SQL' },
    description: {
      es: 'Completa todo el módulo de SQL.',
      en: 'Complete the entire SQL module.',
      pt: 'Complete todo o módulo de SQL.',
    },
    criteria: { type: 'module_complete', moduleSlug: 'sql' },
  },
  {
    slug: 'python-master',
    icon: 'Terminal',
    tier: 'gold',
    name: { es: 'Pythonista', en: 'Pythonista', pt: 'Pythonista' },
    description: {
      es: 'Completa todo el módulo de Python.',
      en: 'Complete the entire Python module.',
      pt: 'Complete todo o módulo de Python.',
    },
    criteria: { type: 'module_complete', moduleSlug: 'python' },
  },
  {
    slug: 'spark-master',
    icon: 'Zap',
    tier: 'gold',
    name: { es: 'Spark Master', en: 'Spark Master', pt: 'Spark Master' },
    description: {
      es: 'Completa el módulo de Apache Spark.',
      en: 'Complete the Apache Spark module.',
      pt: 'Complete o módulo de Apache Spark.',
    },
    criteria: { type: 'module_complete', moduleSlug: 'spark' },
  },

  // Calidad
  {
    slug: 'perfectionist',
    icon: 'Target',
    tier: 'silver',
    name: { es: 'Perfeccionista', en: 'Perfectionist', pt: 'Perfeccionista' },
    description: {
      es: 'Obtén 100% en un quiz.',
      en: 'Score 100% on a quiz.',
      pt: 'Obtenha 100% em um quiz.',
    },
    criteria: { type: 'perfect_score', count: 1 },
  },
  {
    slug: 'quiz-master',
    icon: 'Medal',
    tier: 'gold',
    name: { es: 'Quiz Master', en: 'Quiz Master', pt: 'Quiz Master' },
    description: {
      es: '10 quizzes con puntaje perfecto.',
      en: '10 perfect quiz scores.',
      pt: '10 quizzes com nota perfeita.',
    },
    criteria: { type: 'perfect_score', count: 10 },
  },
  {
    slug: 'fast-learner',
    icon: 'Rocket',
    tier: 'silver',
    name: { es: 'Aprendiz rápido', en: 'Fast learner', pt: 'Aprendiz rápido' },
    description: {
      es: 'Termina una lección antes del tiempo estimado.',
      en: 'Finish a lesson before its estimated time.',
      pt: 'Termine uma lição antes do tempo estimado.',
    },
    criteria: { type: 'fast_learner' },
  },

  // Idiomas
  {
    slug: 'polyglot',
    icon: 'Languages',
    tier: 'silver',
    name: { es: 'Políglota', en: 'Polyglot', pt: 'Poliglota' },
    description: {
      es: 'Usa la app en 2 idiomas distintos.',
      en: 'Use the app in 2 different languages.',
      pt: 'Use o app em 2 idiomas diferentes.',
    },
    criteria: { type: 'polyglot', minLocales: 2 },
  },
  {
    slug: 'cosmopolitan',
    icon: 'Globe',
    tier: 'gold',
    name: { es: 'Cosmopolita', en: 'Cosmopolitan', pt: 'Cosmopolita' },
    description: {
      es: 'Usa la app en 3 idiomas distintos.',
      en: 'Use the app in 3 different languages.',
      pt: 'Use o app em 3 idiomas diferentes.',
    },
    criteria: { type: 'polyglot', minLocales: 3 },
  },

  // Hábitos
  {
    slug: 'weekend-warrior',
    icon: 'PartyPopper',
    tier: 'bronze',
    name: { es: 'Guerrero de fin de semana', en: 'Weekend warrior', pt: 'Guerreiro de fim de semana' },
    description: {
      es: 'Estudia sábado y domingo en la misma semana.',
      en: 'Study on Saturday and Sunday of the same week.',
      pt: 'Estude no sábado e domingo da mesma semana.',
    },
    criteria: { type: 'weekend_warrior' },
  },
  {
    slug: 'comeback-kid',
    icon: 'RefreshCw',
    tier: 'silver',
    name: { es: 'El que regresa', en: 'Comeback kid', pt: 'O que retorna' },
    description: {
      es: 'Vuelve después de 3+ días de pausa.',
      en: 'Return after 3+ days off.',
      pt: 'Retorne após 3+ dias de pausa.',
    },
    criteria: { type: 'comeback', daysAway: 3 },
  },

  // Meta
  {
    slug: 'badge-collector',
    icon: 'Star',
    tier: 'silver',
    name: { es: 'Coleccionista', en: 'Collector', pt: 'Colecionador' },
    description: {
      es: 'Desbloquea 10 logros.',
      en: 'Unlock 10 badges.',
      pt: 'Desbloqueie 10 conquistas.',
    },
    criteria: { type: 'badge_count', count: 10 },
  },
  {
    slug: 'badge-hunter',
    icon: 'StarHalf',
    tier: 'gold',
    name: { es: 'Cazador de logros', en: 'Badge hunter', pt: 'Caçador de conquistas' },
    description: {
      es: 'Desbloquea 20 logros.',
      en: 'Unlock 20 badges.',
      pt: 'Desbloqueie 20 conquistas.',
    },
    criteria: { type: 'badge_count', count: 20 },
  },
  {
    slug: 'completionist',
    icon: 'Trophy',
    tier: 'platinum',
    name: { es: 'Completista', en: 'Completionist', pt: 'Completista' },
    description: {
      es: 'Desbloquea todos los logros.',
      en: 'Unlock every badge.',
      pt: 'Desbloqueie todas as conquistas.',
    },
    criteria: { type: 'badge_count', count: 30 },
  },
];
