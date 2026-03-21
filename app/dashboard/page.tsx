import { ArrowRight, CalendarClock, CheckCircle2, Target } from 'lucide-react';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Container } from '@/components/layout/container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressChart } from '@/components/dashboard/progress-chart';
import { Button } from '@/components/ui/button';
import { formatPercent, getQuizFeedback } from '@/lib/utils';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/login');

  const [courses, progress, quizResults, webinars] = await Promise.all([
    db.course.findMany({ where: { isPublished: true }, include: { lessons: { orderBy: { order: 'asc' } } }, take: 6 }),
    db.userProgress.findMany({ where: { userId: session.user.id }, include: { lesson: { include: { course: true } } }, orderBy: { completedAt: 'desc' } }),
    db.quizResult.findMany({ where: { userId: session.user.id }, include: { quiz: { include: { lesson: true } } }, take: 5, orderBy: { createdAt: 'desc' } }),
    db.webinar.findMany({ where: { isPublished: true }, orderBy: { date: 'asc' }, take: 3 })
  ]);

  const completedLessonIds = new Set(progress.filter((item) => item.completed).map((item) => item.lessonId));
  const totalLessons = courses.reduce((sum, course) => sum + course.lessons.length, 0);
  const completion = totalLessons ? (completedLessonIds.size / totalLessons) * 100 : 0;
  const startedCourses = new Set(progress.map((item) => item.lesson.courseId)).size;

  const nextLesson = courses
    .flatMap((course) => course.lessons.map((lesson) => ({ lesson, course })))
    .find(({ lesson }) => !completedLessonIds.has(lesson.id));

  const chartData = courses.map((course) => {
    const completed = course.lessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;
    return {
      name: course.title.split(' ').slice(0, 2).join(' '),
      progress: course.lessons.length ? Math.round((completed / course.lessons.length) * 100) : 0
    };
  });

  const recentActivity = progress
    .filter((item) => item.completed)
    .slice(0, 4)
    .map((item) => ({
      id: item.id,
      title: item.lesson.title,
      meta: `${item.lesson.course.title} · ${item.completedAt ? new Date(item.completedAt).toLocaleDateString('ru-RU') : 'Сегодня'}`
    }));

  return (
    <Container className="py-10 sm:py-12">
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-muted-foreground">Личный кабинет</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">Здравствуйте, {session.user.name}</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Спокойное рабочее пространство: следующий шаг, прогресс по курсам и ближайшие события в одном месте.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ['Общий прогресс', formatPercent(completion)],
          ['Начатые курсы', String(startedCourses)],
          ['Пройденные квизы', String(quizResults.length)]
        ].map(([label, value]) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Прогресс по курсам</CardTitle>
            <CardDescription>График остаётся компактным, чтобы не отвлекать от главного.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Продолжить обучение
            </CardTitle>
            <CardDescription>Следующий логичный шаг по вашей текущей траектории.</CardDescription>
          </CardHeader>
          <CardContent>
            {nextLesson ? (
              <div className="space-y-5">
                <div className="rounded-xl border border-border/80 bg-muted/40 p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    {nextLesson.course.title}
                  </p>
                  <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">{nextLesson.lesson.title}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{nextLesson.lesson.description}</p>
                </div>
                <Button asChild>
                  <Link href={`/courses/${nextLesson.course.slug}/lessons/${nextLesson.lesson.id}`}>
                    Открыть урок
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                Все текущие уроки пройдены. Перейдите в каталог, чтобы выбрать новую программу.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Недавняя активность
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.length ? recentActivity.map((item) => (
              <div key={item.id} className="border-t border-border/70 pt-4 first:border-t-0 first:pt-0">
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.meta}</p>
              </div>
            )) : <p className="text-sm leading-6 text-muted-foreground">Пока нет завершённых уроков — начните с первого модуля.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Результаты тестов</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quizResults.length ? quizResults.map((result) => (
              <div key={result.id} className="border-t border-border/70 pt-4 first:border-t-0 first:pt-0">
                <p className="font-medium text-foreground">{result.quiz.lesson.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{result.score}% · {getQuizFeedback(result.score)}</p>
              </div>
            )) : <p className="text-sm leading-6 text-muted-foreground">Пройдите первый тест — здесь появятся результаты.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              Ближайшие вебинары
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {webinars.map((webinar) => (
              <div key={webinar.id} className="border-t border-border/70 pt-4 first:border-t-0 first:pt-0">
                <p className="font-medium text-foreground">{webinar.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{new Date(webinar.date).toLocaleString('ru-RU')}</p>
              </div>
            ))}
            <div className="rounded-xl border border-border/80 bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
              Один фокус на неделю: завершите следующий урок и повторите квиз, если результат был ниже 60%.
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
