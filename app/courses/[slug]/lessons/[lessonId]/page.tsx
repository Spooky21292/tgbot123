import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { QuizForm } from '@/components/forms/quiz-form';

export default async function LessonPage({ params }: { params: { slug: string; lessonId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/login');
  const lesson = await db.lesson.findUnique({ where: { id: params.lessonId }, include: { course: true, quiz: { include: { questions: true } } } });
  if (!lesson) notFound();
  return <Container className="py-12"><Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Курсы', href: '/courses' }, { label: lesson.course.title, href: `/courses/${lesson.course.slug}` }, { label: lesson.title }]} /><div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"><div><h1 className="text-4xl font-semibold">{lesson.title}</h1><p className="mt-3 text-muted-foreground">{lesson.description}</p><div className="mt-6 overflow-hidden rounded-3xl border"><iframe title={lesson.title} src={lesson.videoUrl} className="aspect-video w-full" allowFullScreen /></div><article className="prose-finance mt-8 rounded-3xl border p-6"><div className="whitespace-pre-wrap">{lesson.content}</div></article></div><div>{lesson.quiz ? <QuizForm quiz={lesson.quiz} lessonId={lesson.id} /> : <div className="rounded-3xl border p-6">Тест для этого урока пока не добавлен.</div>}</div></div></Container>;
}
