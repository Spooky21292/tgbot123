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
  return <Container className="py-12"><Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Вебинары' }]} /><h1 className="text-4xl font-semibold">Предстоящие вебинары</h1><div className="mt-8 grid gap-6 lg:grid-cols-3">{webinars.map((webinar) => <Card key={webinar.id}><CardHeader><CardTitle>{webinar.title}</CardTitle><CardDescription>{webinar.description}</CardDescription></CardHeader><CardContent><p className="mb-2 text-sm text-muted-foreground">Спикер: {webinar.speaker}</p><p className="mb-4 text-sm text-muted-foreground">{new Date(webinar.date).toLocaleString('ru-RU')}</p><Button asChild><Link href={`/webinars/${webinar.id}`}>Записаться</Link></Button></CardContent></Card>)}</div></Container>;
}
