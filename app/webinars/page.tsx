import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export const metadata: Metadata = { title: 'Вебинары', description: 'Онлайн-уроки и вебинары FinUm' };

export default async function WebinarsPage() {
  const [webinars, session] = await Promise.all([
    db.webinar.findMany({ where: { isPublished: true }, orderBy: { date: 'asc' } }),
    getServerSession(authOptions)
  ]);
  const webinarHref = (id: string) => session?.user ? `/webinars/${id}` : '/auth/register';

  return (
    <Container className="py-10 sm:py-12">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Вебинары' }]} />
      <div className="max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Вебинары и записи</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Все вебинары входят в доступ к платформе: их можно смотреть вживую, а после эфира материалы остаются в записи.
        </p>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {webinars.map((webinar: any) => (
          <Card key={webinar.id} className="flex h-full flex-col">
            <CardHeader className="flex-1">
              <CardTitle>{webinar.title}</CardTitle>
              <CardDescription>{webinar.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto flex flex-col">
              <p className="mb-2 text-sm text-muted-foreground">Спикер: {webinar.speaker}</p>
              <p className="mb-2 text-sm text-muted-foreground">{new Date(webinar.date).toLocaleString('ru-RU')}</p>
              <p className="mb-4 text-sm text-muted-foreground">Входит в подписку и остаётся в библиотеке записей.</p>
              <Button className="self-start" asChild>
                <Link href={webinarHref(webinar.id)}>Открыть вебинар</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
