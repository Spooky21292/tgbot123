import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function WebinarPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const webinar = await db.webinar.findUnique({ where: { id: params.id } });
  if (!webinar) notFound();
  const enrolled = session?.user ? await db.webinarEnrollment.findUnique({ where: { userId_webinarId: { userId: session.user.id, webinarId: webinar.id } } }) : null;
  return <Container className="py-12"><Card><CardHeader><CardTitle>{webinar.title}</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{webinar.description}</p><p className="mt-4 text-sm text-muted-foreground">Спикер: {webinar.speaker}</p><p className="text-sm text-muted-foreground">Дата: {new Date(webinar.date).toLocaleString('ru-RU')}</p><form action="/api/webinar-enroll" method="post" className="mt-6"><input type="hidden" name="webinarId" value={webinar.id} /><Button type="submit" disabled={!session?.user || Boolean(enrolled)}>{!session?.user ? 'Войдите для записи' : enrolled ? 'Вы уже записаны' : 'Записаться'}</Button></form></CardContent></Card></Container>;
}
