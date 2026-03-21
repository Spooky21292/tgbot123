import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock3, PlayCircle } from 'lucide-react';
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
    <Container className="py-10 sm:py-12">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Курсы', href: '/courses' }, { label: course.title }]} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{ageGroupLabel(course.ageGroup)}</Badge>
              <Badge>{courseLevelLabel(course.level)}</Badge>
            </div>
            <h1 className="mt-5 max-w-4xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{course.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{course.description}</p>
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <PlayCircle className="h-4 w-4" />
              {course.lessons.length} уроков с аккуратной подачей, примерами и практикой
            </div>
            {course.lessons[0] && (
              <Button className="mt-8" asChild>
                <Link href={`/courses/${course.slug}/lessons/${course.lessons[0].id}`}>Начать курс</Link>
              </Button>
            )}
          </div>

          <div className="mt-8 space-y-4">
            {course.lessons.map((lesson) => (
              <Card key={lesson.id}>
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Урок {lesson.order}</p>
                      <CardTitle className="mt-1 text-xl">{lesson.title}</CardTitle>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" />
                      {lesson.durationMinutes} мин
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 max-w-3xl text-sm leading-6 text-muted-foreground">{lesson.description}</p>
                  <Button variant="secondary" asChild>
                    <Link href={`/courses/${course.slug}/lessons/${lesson.id}`}>Открыть урок</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Структура курса</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>Материал подаётся последовательно: сначала базовая логика, затем реальные сценарии и практические решения.</p>
            <p>Каждый урок можно пройти отдельно, но вместе они дают цельную учебную траекторию.</p>
            <p>После чтения удобно сразу перейти к тесту и зафиксировать главный вывод.</p>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
