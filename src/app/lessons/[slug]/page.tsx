import { notFound } from 'next/navigation';
import { getAllLessonSlugs, getLesson } from '@/content/data-engineering/registry';
import { LessonView } from './lesson-view';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllLessonSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

export default async function LessonPage({ params }: PageProps) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  return <LessonView slug={slug} />;
}
