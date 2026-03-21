import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { getCourses } from '@/lib/data';
import { ageGroupLabel, courseLevelLabel } from '@/lib/utils';

export const metadata: Metadata = { title: 'Курсы', description: 'Каталог курсов по финансовой грамотности' };

export default async function CoursesPage({ searchParams }: { searchParams?: { ageGroup?: string; level?: string; search?: string } }) {
  const courses = await getCourses(searchParams);

  return (
    <Container className="py-12">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Курсы' }]} />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Каталог курсов</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Подберите программу под возраст, уровень подготовки и ближайшую жизненную задачу.</p>
        </div>
        <form className="grid gap-3 rounded-[28px] border border-slate-200/80 bg-white p-4 shadow-soft sm:grid-cols-4 dark:bg-slate-950/70">
          <Input name="search" placeholder="Поиск по курсам" defaultValue={searchParams?.search} />
          <Select name="ageGroup" defaultValue={searchParams?.ageGroup ?? ''}>
            <option value="">Все возрасты</option>
            <option value="12-17">12–17</option>
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

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {courses.length ? (
          courses.map((course) => (
            <Card key={course.id} className="rounded-[30px] border-slate-200/80">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <Badge>{ageGroupLabel(course.ageGroup)}</Badge>
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{courseLevelLabel(course.level)}</span>
                </div>
                <CardTitle className="mt-4 text-2xl">{course.title}</CardTitle>
                <CardDescription className="leading-6">{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">{course.lessons.length} уроков · структурированный маршрут обучения</p>
                <Button asChild>
                  <Link href={`/courses/${course.slug}`}>Открыть</Link>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="rounded-[30px] lg:col-span-3">
            <CardContent className="pt-6 text-muted-foreground">Курсы не найдены. Попробуйте изменить фильтры или поисковый запрос.</CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
}
