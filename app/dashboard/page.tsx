import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Container } from '@/components/layout/container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressChart } from '@/components/dashboard/progress-chart';
import { formatPercent, getQuizFeedback } from '@/lib/utils';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/login');

  const [courses, progress, quizResults, webinars] = await Promise.all([
    db.course.findMany({ where: { isPublished: true }, include: { lessons: true }, take: 3 }),
    db.userProgress.findMany({ where: { userId: session.user.id }, include: { lesson: { include: { course: true } } } }),
    db.quizResult.findMany({ where: { userId: session.user.id }, include: { quiz: { include: { lesson: true } } }, take: 5, orderBy: { createdAt: 'desc' } }),
    db.webinar.findMany({ where: { isPublished: true }, orderBy: { date: 'asc' }, take: 3 })
  ]);

  const totalLessons = courses.reduce((sum, course) => sum + course.lessons.length, 0);
  const completion = totalLessons ? (progress.filter((item) => item.completed).length / totalLessons) * 100 : 0;
  const chartData = courses.map((course) => {
    const completed = progress.filter((item) => item.lesson.courseId === course.id && item.completed).length;
    return { name: course.title.split(' ').slice(0, 2).join(' '), progress: course.lessons.length ? Math.round((completed / course.lessons.length) * 100) : 0 };
  });

  return <Container className="py-12"><div className="grid gap-6 lg:grid-cols-4"><Card className="lg:col-span-2"><CardHeader><CardTitle>Здравствуйте, {session.user.name}</CardTitle><CardDescription>Ваш общий прогресс обучения</CardDescription></CardHeader><CardContent><div className="text-5xl font-semibold text-primary">{formatPercent(completion)}</div><p className="mt-2 text-sm text-muted-foreground">Продолжайте обучение в комфортном темпе — устойчивость формируется постепенно.</p></CardContent></Card><Card><CardHeader><CardTitle>Начатые курсы</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold">{new Set(progress.map((p) => p.lesson.course.title)).size}</p></CardContent></Card><Card><CardHeader><CardTitle>Последние тесты</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold">{quizResults.length}</p></CardContent></Card></div><div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><Card><CardHeader><CardTitle>График прогресса</CardTitle><CardDescription>Динамика завершения по курсам</CardDescription></CardHeader><CardContent><ProgressChart data={chartData} /></CardContent></Card><div className="space-y-6"><Card><CardHeader><CardTitle>Последние результаты тестов</CardTitle></CardHeader><CardContent className="space-y-4">{quizResults.length ? quizResults.map((result) => <div key={result.id} className="rounded-2xl border p-4"><p className="font-medium">{result.quiz.lesson.title}</p><p className="text-sm text-muted-foreground">{result.score}% · {getQuizFeedback(result.score)}</p></div>) : <p className="text-sm text-muted-foreground">Пока нет результатов тестов.</p>}</CardContent></Card><Card><CardHeader><CardTitle>Ближайшие онлайн-уроки</CardTitle></CardHeader><CardContent className="space-y-4">{webinars.map((webinar) => <div key={webinar.id} className="rounded-2xl border p-4"><p className="font-medium">{webinar.title}</p><p className="text-sm text-muted-foreground">{new Date(webinar.date).toLocaleString('ru-RU')}</p></div>)}</CardContent></Card><Card><CardHeader><CardTitle>Рекомендации</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground"><p>• Продолжите курс по своей возрастной группе.</p><p>• Пройдите ближайший вебинар по бюджету или инфляции.</p><p>• Включите Telegram-бота для напоминаний.</p></CardContent></Card></div></div></Container>;
}
