import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ageGroupLabel } from '@/lib/utils';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const course = await db.course.findUnique({ where: { slug: params.slug } });
  return { title: course?.title ?? 'Курс', description: course?.description };
}

export default async function CoursePage({ params }: { params: { slug: string } }) {
  const course = await db.course.findUnique({ where: { slug: params.slug }, include: { lessons: { orderBy: { order: 'asc' } } } });
  if (!course) notFound();
  return <Container className="py-12"><Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Курсы', href: '/courses' }, { label: course.title }]} /><div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]"><div><Badge>{ageGroupLabel(course.ageGroup)}</Badge><h1 className="mt-4 text-4xl font-semibold">{course.title}</h1><p className="mt-4 text-lg text-muted-foreground">{course.description}</p><Button className="mt-6" asChild><Link href={`/courses/${course.slug}/lessons/${course.lessons[0]?.id}`}>Начать курс</Link></Button><div className="mt-10 space-y-4">{course.lessons.map((lesson) => <Card key={lesson.id}><CardHeader><CardTitle className="text-lg">Урок {lesson.order}. {lesson.title}</CardTitle></CardHeader><CardContent><p className="mb-4 text-sm text-muted-foreground">{lesson.description}</p><Button variant="secondary" asChild><Link href={`/courses/${course.slug}/lessons/${lesson.id}`}>Открыть урок</Link></Button></CardContent></Card>)}</div></div><Card className="h-fit"><CardHeader><CardTitle>Что внутри</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-muted-foreground"><p>• Видео-уроки и материалы</p><p>• Квизы после каждого урока</p><p>• Отметка прогресса и рекомендации</p><p>• Подходит для уровня {course.level}</p></CardContent></Card></div></Container>;
}
