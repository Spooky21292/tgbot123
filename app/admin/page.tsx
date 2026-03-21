import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Container } from '@/components/layout/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/login');
  if (session.user.role !== 'admin') redirect('/dashboard');
  const [users, courses, webinars, contacts, articles] = await Promise.all([
    db.user.findMany({ orderBy: { createdAt: 'desc' } }),
    db.course.findMany({ include: { lessons: true }, orderBy: { createdAt: 'desc' } }),
    db.webinar.findMany({ orderBy: { date: 'asc' } }),
    db.contactRequest.findMany({ orderBy: { createdAt: 'desc' } }),
    db.article.findMany({ orderBy: { createdAt: 'desc' } })
  ]);
  return <Container className="py-12"><h1 className="text-4xl font-semibold">Админ-панель</h1><div className="mt-8 grid gap-6 lg:grid-cols-2">{[
    ['Пользователи', users.map((item) => `${item.name} — ${item.email} (${item.role})`)],
    ['Курсы', courses.map((item) => `${item.title} — ${item.lessons.length} уроков`)],
    ['Вебинары', webinars.map((item) => `${item.title} — ${new Date(item.date).toLocaleDateString('ru-RU')}`)],
    ['Заявки', contacts.map((item) => `${item.name} — ${item.email}`)],
    ['Статьи', articles.map((item) => `${item.title} — ${item.category}`)]
  ].map(([title, items]) => <Card key={String(title)}><CardHeader><CardTitle>{String(title)}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground">{(items as string[]).length ? (items as string[]).map((item) => <p key={item}>{item}</p>) : <p>Пока пусто.</p>}</CardContent></Card>)}</div><p className="mt-8 text-sm text-muted-foreground">Админ-панель собрана как операционный центр: здесь видны пользователи, курсы, вебинары, обращения и контент блога.</p></Container>;
}
