import { ArrowRight, CalendarClock, CheckCircle2, Sparkles, Target } from 'lucide-react';
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
      title: `Завершён урок «${item.lesson.title}»`,
      meta: item.completedAt ? new Date(item.completedAt).toLocaleDateString('ru-RU') : 'Сегодня'
    }));

  return (
    <Container className="py-12">
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="rounded-[32px] border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900 text-white">
          <CardContent className="pt-8">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-200">Личный кабинет</p>
            <h1 className="mt-3 text-4xl font-semibold">Здравствуйте, {session.user.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">Ваш прогресс собран в одном месте: следующие шаги, завершённые уроки, результаты тестов и ближайшие вебинары.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] bg-white/10 p-5">
                <p className="text-sm text-sky-100">Общий прогресс</p>
                <p className="mt-2 text-4xl font-semibold">{formatPercent(completion)}</p>
              </div>
              <div className="rounded-[24px] bg-white/10 p-5">
                <p className="text-sm text-sky-100">Начатые курсы</p>
                <p className="mt-2 text-4xl font-semibold">{startedCourses}</p>
              </div>
              <div className="rounded-[24px] bg-white/10 p-5">
                <p className="text-sm text-sky-100">Квизы</p>
                <p className="mt-2 text-4xl font-semibold">{quizResults.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-slate-200/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Рекомендуем продолжить</CardTitle>
            <CardDescription>Следующий логичный шаг по вашей траектории</CardDescription>
          </CardHeader>
          <CardContent>
            {nextLesson ? (
              <div className="space-y-4">
                <div className="rounded-[24px] bg-secondary p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{nextLesson.course.title}</p>
                  <p className="mt-2 text-xl font-semibold">{nextLesson.lesson.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{nextLesson.lesson.description}</p>
                </div>
                <Button asChild>
                  <Link href={`/courses/${nextLesson.course.slug}/lessons/${nextLesson.lesson.id}`}>Открыть урок <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">Все текущие уроки пройдены. Перейдите в каталог, чтобы открыть новую программу.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[32px] border-slate-200/80">
          <CardHeader>
            <CardTitle>Динамика по курсам</CardTitle>
            <CardDescription>Прогресс по ключевым программам в одном графике</CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressChart data={chartData} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[32px] border-slate-200/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-accent" /> Последняя активность</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.length ? recentActivity.map((item) => (
                <div key={item.id} className="rounded-[24px] border border-slate-200/80 p-4">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.meta}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">Пока нет завершённых уроков — начните с первого модуля.</p>}
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-slate-200/80">
            <CardHeader>
              <CardTitle>Результаты тестов</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quizResults.length ? quizResults.map((result) => (
                <div key={result.id} className="rounded-[24px] border border-slate-200/80 p-4">
                  <p className="font-medium">{result.quiz.lesson.title}</p>
                  <p className="text-sm text-muted-foreground">{result.score}% · {getQuizFeedback(result.score)}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">Пройдите первый тест — здесь появятся результаты.</p>}
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-slate-200/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-primary" /> Ближайшие вебинары</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {webinars.map((webinar) => (
                <div key={webinar.id} className="rounded-[24px] border border-slate-200/80 p-4">
                  <p className="font-medium">{webinar.title}</p>
                  <p className="text-sm text-muted-foreground">{new Date(webinar.date).toLocaleString('ru-RU')}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-slate-200/80 bg-secondary/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent" /> Рекомендации</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-7 text-muted-foreground">
              <p>• Повторите последний квиз, если результат ниже 60%.</p>
              <p>• Запланируйте один финансовый ритуал на неделю: учёт расходов или проверку целей.</p>
              <p>• Подключите Telegram-бота, чтобы не терять темп между уроками.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
