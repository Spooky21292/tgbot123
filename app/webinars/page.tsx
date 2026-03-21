import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';

export const metadata: Metadata = { title: 'Вебинары', description: 'Онлайн-уроки и вебинары FinSkills Pro' };

export default async function WebinarsPage() {
  const webinars = await db.webinar.findMany({ where: { isPublished: true }, orderBy: { date: 'asc' } });

  return (
    <Container className="py-10 sm:py-12">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Вебинары' }]} />
      <div className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Предстоящие вебинары</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">Спокойные разборы тем, которые помогают принимать более уверенные финансовые решения.</p>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {webinars.map((webinar) => (
          <Card key={webinar.id}>
            <CardHeader>
              <CardTitle>{webinar.title}</CardTitle>
              <CardDescription>{webinar.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm text-muted-foreground">Спикер: {webinar.speaker}</p>
              <p className="mb-4 text-sm text-muted-foreground">{new Date(webinar.date).toLocaleString('ru-RU')}</p>
              <Button asChild>
                <Link href={`/webinars/${webinar.id}`}>Записаться</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
