import { Clock3, PlayCircle } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { QuizForm } from '@/components/forms/quiz-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LessonContent } from '@/components/courses/lesson-content';

export default async function LessonPage({ params }: { params: { slug: string; lessonId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/login');

  const lesson = await db.lesson.findUnique({
    where: { id: params.lessonId },
    include: { course: true, quiz: { include: { questions: true } } }
  });

  if (!lesson) notFound();

  return (
    <Container className="py-10 sm:py-12">
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Курсы', href: '/courses' },
          { label: lesson.course.title, href: `/courses/${lesson.course.slug}` },
          { label: lesson.title }
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
                <PlayCircle className="h-4 w-4" />
                Видео + конспект
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
                <Clock3 className="h-4 w-4" />
                {lesson.durationMinutes} минут
              </span>
            </div>
            <h1 className="mt-5 max-w-4xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {lesson.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{lesson.description}</p>
            <div className="mt-8 overflow-hidden rounded-2xl border border-border/80 bg-slate-950">
              <iframe title={lesson.title} src={lesson.videoUrl} className="aspect-video w-full" allowFullScreen />
            </div>
          </div>

          <article className="rounded-2xl border border-border/80 bg-card px-6 py-8 sm:px-10 sm:py-10">
            <div className="mx-auto max-w-3xl">
              <LessonContent content={lesson.content} />
            </div>
          </article>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Как пройти урок с пользой</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
              <p>Сначала посмотрите видео, затем прочитайте конспект в спокойном темпе.</p>
              <p>Отмечайте один практический вывод, который можно применить сегодня.</p>
              <p>В конце пройдите мини-тест, чтобы закрепить ключевые идеи.</p>
            </CardContent>
          </Card>

          {lesson.quiz ? (
            <QuizForm quiz={lesson.quiz} lessonId={lesson.id} />
          ) : (
            <div className="rounded-2xl border border-border/80 bg-card p-6 text-sm text-muted-foreground">
              Тест для этого урока пока не добавлен.
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
