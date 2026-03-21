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
    <Container className="py-12">
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Курсы', href: '/courses' },
          { label: lesson.course.title, href: `/courses/${lesson.course.slug}` },
          { label: lesson.title }
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="rounded-[32px] border border-slate-200/80 bg-white p-8 shadow-soft dark:bg-slate-950/70">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2"><PlayCircle className="h-4 w-4" /> Видео + конспект</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2"><Clock3 className="h-4 w-4" /> {lesson.durationMinutes} минут</span>
            </div>
            <h1 className="mt-5 text-4xl font-semibold">{lesson.title}</h1>
            <p className="mt-3 text-lg leading-7 text-muted-foreground">{lesson.description}</p>
            <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200/80 bg-slate-950">
              <iframe title={lesson.title} src={lesson.videoUrl} className="aspect-video w-full" allowFullScreen />
            </div>
          </div>

          <article className="mt-8 rounded-[32px] border border-slate-200/80 bg-white p-8 shadow-soft dark:bg-slate-950/70">
            <LessonContent content={lesson.content} />
          </article>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[32px] border-slate-200/80">
            <CardHeader>
              <CardTitle>Что вы получите после урока</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
              <p>— Понимание ключевой темы без перегруза терминами.</p>
              <p>— Примеры из жизни подростков, студентов или молодых взрослых.</p>
              <p>— Маленькое действие, которое можно выполнить уже сегодня.</p>
            </CardContent>
          </Card>

          {lesson.quiz ? (
            <QuizForm quiz={lesson.quiz} lessonId={lesson.id} />
          ) : (
            <div className="rounded-[32px] border border-slate-200/80 p-6">
              Тест для этого урока пока не добавлен.
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
