import { ArrowRight, CalendarClock, CheckCircle2, CreditCard, Users } from 'lucide-react';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Container } from '@/components/layout/container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressChart } from '@/components/dashboard/progress-chart';
import { Button } from '@/components/ui/button';
import { formatPercent } from '@/lib/utils';
import { FamilyMembersManager } from '@/components/dashboard/family-members-manager';
import { LeaveFamilyButton } from '@/components/dashboard/leave-family-button';
import { getViewerAccess, isFamilyPlan } from '@/lib/access';

const tariffPlans = [
  { id: 'learning', name: 'Learning', price: '499 ₽ / мес', text: 'Полный доступ ко всем курсам, вебинарам и записям.' },
  { id: 'family', name: 'Family', price: '999 ₽ / мес', text: 'Общий доступ для семьи с единым архивом материалов.' }
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/login');

  const [courses, progress, webinars, access] = await Promise.all([
    db.course.findMany({ where: { isPublished: true }, include: { lessons: { orderBy: { order: 'asc' } } }, take: 6 }),
    db.userProgress.findMany({ where: { userId: session.user.id }, include: { lesson: { include: { course: true } } }, orderBy: { completedAt: 'desc' } }),
    db.webinar.findMany({ where: { isPublished: true }, orderBy: { date: 'asc' }, take: 2 }),
    getViewerAccess(session.user.id)
  ]);

  const completedLessonIds = new Set(progress.filter((item) => item.completed).map((item) => item.lessonId));
  const totalLessons = courses.reduce((sum, course) => sum + course.lessons.length, 0);
  const completion = totalLessons ? (completedLessonIds.size / totalLessons) * 100 : 0;
  const startedCourses = new Set(progress.map((item) => item.lesson.courseId)).size;

  const nextLesson = courses
    .flatMap((course) => course.lessons.map((lesson) => ({ lesson, course })))
    .find(({ lesson }) => !completedLessonIds.has(lesson.id));

  const recentActivity = progress
    .filter((item) => item.completed)
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      title: item.lesson.title,
      meta: `${item.lesson.course.title} · ${item.completedAt ? new Date(item.completedAt).toLocaleDateString('ru-RU') : 'Сегодня'}`
    }));

  const chartData = courses.slice(0, 4).map((course) => {
    const completed = course.lessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;
    return {
      name: course.title.split(' ').slice(0, 2).join(' '),
      progress: course.lessons.length ? Math.round((completed / course.lessons.length) * 100) : 0
    };
  });

  return (
    <Container className="py-10 sm:py-12">
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-muted-foreground">Личный кабинет</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">Здравствуйте, {session.user.name}</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Лаконичное пространство: следующий шаг, текущий прогресс и управление доступом без лишней нагрузки.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {[
          ['Общий прогресс', formatPercent(completion)],
          ['Начатые курсы', String(startedCourses)],
          ['Пройдено уроков', String(completedLessonIds.size)],
          ['Доступ', access?.accessActive ? `до ${new Date(access.accessExpiresAt ?? '').toLocaleDateString('ru-RU')}` : 'не активен']
        ].map(([label, value]) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Продолжить обучение</CardTitle>
            <CardDescription>Только один следующий шаг, чтобы не перегружать кабинет.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {nextLesson ? (
              <>
                <div className="rounded-2xl border border-border/80 bg-muted/40 p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{nextLesson.course.title}</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">{nextLesson.lesson.title}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{nextLesson.lesson.description}</p>
                </div>
                <Button asChild>
                  <Link href={`/courses/${nextLesson.course.slug}/lessons/${nextLesson.lesson.id}`}>
                    Открыть урок
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">Все текущие уроки пройдены. Можно выбрать новую программу в каталоге.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Прогресс</CardTitle>
            <CardDescription>Компактный график по главным курсам.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressChart data={chartData} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Последняя активность</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.length ? recentActivity.map((item) => (
              <div key={item.id} className="border-t border-border/70 pt-4 first:border-t-0 first:pt-0">
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.meta}</p>
              </div>
            )) : <p className="text-sm leading-6 text-muted-foreground">Пока нет завершённых уроков — начните с первого модуля.</p>}

            <div className="border-t border-border/70 pt-4">
              <p className="mb-2 flex items-center gap-2 font-medium text-foreground"><CalendarClock className="h-4 w-4 text-primary" /> Вебинары в доступе</p>
              {webinars.map((webinar) => (
                <div key={webinar.id} className="mt-3 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{webinar.title}</p>
                  <p>{new Date(webinar.date).toLocaleDateString('ru-RU')}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Тарифы и оплата</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {tariffPlans.map((plan) => (
                <Card key={plan.id} id={plan.id} className="rounded-[28px] bg-white/90 dark:bg-card">
                  <CardHeader className="px-6 py-8 sm:p-8 sm:pb-6">
                    <div className="grid w-full grid-cols-1 items-center justify-center text-left">
                      <div>
                        <h3 className="text-lg font-medium tracking-tight text-slate-600 dark:text-slate-300 lg:text-2xl">{plan.name}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{plan.text}</p>
                      </div>
                      <div className="mt-6">
                        <p>
                          <span className="text-4xl font-light tracking-tight text-foreground">{plan.price.split(' / ')[0]}</span>
                          <span className="text-base font-medium text-muted-foreground"> / {plan.price.split(' / ')[1]}</span>
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex px-6 pb-8 sm:px-8">
                    <Button className="w-full rounded-full" asChild>
                      <Link href={`/pricing?plan=${plan.id}`}>Оплатить тариф</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {access && isFamilyPlan(access) ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Семейный доступ</CardTitle>
                <CardDescription>Можно добавить до 3 человек по email, если у них нет собственного активного тарифа и они не состоят в другой семье.</CardDescription>
              </CardHeader>
              <CardContent>
                <FamilyMembersManager members={access.familyMembers} />
              </CardContent>
            </Card>
          ) : null}

          {access?.familyOwner ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Вы в семейном тарифе</CardTitle>
                <CardDescription>Покупка собственного тарифа недоступна, пока вы состоите в семье.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="text-muted-foreground">Организатор: <span className="font-medium text-foreground">{access.familyOwner.name}</span> · {access.familyOwner.email}</p>
                <div className="space-y-2">
                  {access.familyGroup.map((member) => (
                    <div key={member.id} className="rounded-xl border border-border/80 px-4 py-3">
                      <p className="font-medium text-foreground">{member.name || member.email}</p>
                      {member.email ? <p className="text-muted-foreground">{member.email}</p> : null}
                    </div>
                  ))}
                </div>
                <LeaveFamilyButton />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </Container>
  );
}
