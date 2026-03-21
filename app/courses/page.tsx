import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { getCourses } from '@/lib/data';
import { authOptions } from '@/lib/auth';
import { ageGroupLabel, courseLevelLabel } from '@/lib/utils';
import { getViewerAccess } from '@/lib/access';

export const metadata: Metadata = { title: 'Курсы', description: 'Каталог курсов по финансовой грамотности' };

export default async function CoursesPage({ searchParams }: { searchParams?: { ageGroup?: string; level?: string; search?: string } }) {
  const session = await getServerSession(authOptions);
  const [courses, access] = await Promise.all([
    getCourses({ ...searchParams, preferredAgeGroup: session?.user?.ageGroup }),
    session?.user ? getViewerAccess(session.user.id) : Promise.resolve(null)
  ]);
  const accessActive = Boolean(access?.accessActive);

  return (
    <Container className="py-10 sm:py-12">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Курсы' }]} />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Каталог курсов</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Спокойные образовательные программы по бюджету, привычкам, безопасности и долгосрочным решениям.
          </p>
        </div>
        <form className="grid gap-3 rounded-2xl border border-border/80 bg-card p-4 sm:grid-cols-4">
          <Input name="search" placeholder="Поиск по курсам" defaultValue={searchParams?.search} />
          <Select name="ageGroup" defaultValue={searchParams?.ageGroup ?? ''}>
            <option value="">Все возрасты</option>
            <option value="14-17">14–17</option>
            <option value="18-25">18–25</option>
            <option value="26+">26+</option>
          </Select>
          <Select name="level" defaultValue={searchParams?.level ?? ''}>
            <option value="">Все уровни</option>
            <option value="beginner">Старт</option>
            <option value="intermediate">Практика</option>
            <option value="advanced">Продвинутый</option>
          </Select>
          <Button type="submit">Применить</Button>
        </form>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {courses.length ? (
          courses.map((course) => (
            <Card key={course.id} className="flex h-full flex-col">
              <CardHeader className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <Badge>{ageGroupLabel(course.ageGroup)}</Badge>
                  <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{courseLevelLabel(course.level)}</span>
                </div>
                <CardTitle className="mt-3 text-xl">{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex flex-col">
                <p className="mb-4 text-sm text-muted-foreground">{course.lessons.length} уроков · структурированная траектория</p>
                {course.isPremium && !accessActive ? (
                  <Button className="self-start" variant="secondary" asChild>
                    <Link href="/pricing?plan=learning">🔒 Открыть по тарифу</Link>
                  </Button>
                ) : (
                  <Button className="self-start" asChild>
                    <Link href={`/courses/${course.slug}`}>Открыть</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="lg:col-span-3">
            <CardContent className="pt-6 text-muted-foreground">Курсы не найдены. Попробуйте изменить фильтры или поисковый запрос.</CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
}
