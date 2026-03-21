import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock3, PlayCircle, ShieldCheck } from 'lucide-react';
import { db } from '@/lib/db';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ageGroupLabel, courseLevelLabel } from '@/lib/utils';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const course = await db.course.findUnique({ where: { slug: params.slug } });
  return { title: course?.title ?? 'Курс', description: course?.description };
}

export default async function CoursePage({ params }: { params: { slug: string } }) {
  const course = await db.course.findUnique({ where: { slug: params.slug }, include: { lessons: { orderBy: { order: 'asc' } } } });
  if (!course) notFound();

  return (
    <Container className="py-12">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Курсы', href: '/courses' }, { label: course.title }]} />
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="rounded-[32px] border border-slate-200/80 bg-white p-8 shadow-soft dark:bg-slate-950/70">
            <div className="flex flex-wrap items-center gap-3">
              <Badge>{ageGroupLabel(course.ageGroup)}</Badge>
              <Badge className="bg-slate-950 text-white dark:bg-white dark:text-slate-950">{courseLevelLabel(course.level)}</Badge>
            </div>
            <h1 className="mt-5 text-4xl font-semibold">{course.title}</h1>
            <p className="mt-4 text-lg leading-7 text-muted-foreground">{course.description}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2"><PlayCircle className="h-4 w-4" /> {course.lessons.length} уроков</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2"><ShieldCheck className="h-4 w-4" /> Практические советы и задания</span>
            </div>
            {course.lessons[0] && (
              <Button className="mt-8" asChild>
                <Link href={`/courses/${course.slug}/lessons/${course.lessons[0].id}`}>Начать курс</Link>
              </Button>
            )}
          </div>

          <div className="mt-10 space-y-4">
            {course.lessons.map((lesson) => (
              <Card key={lesson.id} className="rounded-[28px] border-slate-200/80">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-lg">Урок {lesson.order}. {lesson.title}</CardTitle>
                    <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" /> {lesson.durationMinutes} мин</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm leading-6 text-muted-foreground">{lesson.description}</p>
                  <Button variant="secondary" asChild>
                    <Link href={`/courses/${course.slug}/lessons/${lesson.id}`}>Открыть урок</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="h-fit rounded-[32px] border-slate-200/80">
          <CardHeader>
            <CardTitle>Что внутри программы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
            <p>• Пошаговая логика: от базовых понятий к реальным сценариям.</p>
            <p>• Уроки, которые удобно пройти за один вечер или в дороге.</p>
            <p>• Тесты после модулей и видимый прогресс в кабинете.</p>
            <p>• Понятный язык без лишней академичности.</p>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
