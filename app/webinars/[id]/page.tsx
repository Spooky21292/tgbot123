import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function WebinarPage({ params }: { params: { id: string } }) {
  const webinar = await db.webinar.findUnique({ where: { id: params.id } });
  if (!webinar) notFound();

  return (
    <Container className="py-10 sm:py-12">
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl">{webinar.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-sm leading-7 text-muted-foreground">
          <p>{webinar.description}</p>
          <div className="grid gap-3 rounded-2xl border border-border/80 bg-muted/30 p-5 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Спикер</p>
              <p className="mt-1 text-sm font-medium text-foreground">{webinar.speaker}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Дата эфира</p>
              <p className="mt-1 text-sm font-medium text-foreground">{new Date(webinar.date).toLocaleString('ru-RU')}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border/80 bg-card p-5">
            <p className="font-medium text-foreground">Доступ включён в платформу</p>
            <p className="mt-2">Покупатели доступа могут смотреть эфир и возвращаться к записи позже — отдельная запись на вебинар не требуется.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={webinar.meetingUrl}>Открыть страницу вебинара</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/pricing">Посмотреть доступ</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
