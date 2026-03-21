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
import { ageGroupLabel } from '@/lib/utils';

export const metadata: Metadata = { title: 'Курсы', description: 'Каталог курсов по финансовой грамотности' };

export default async function CoursesPage({ searchParams }: { searchParams?: { ageGroup?: string; level?: string; search?: string } }) {
  const courses = await getCourses(searchParams);
  return <Container className="py-12"><Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Курсы' }]} /><div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><h1 className="text-4xl font-semibold">Каталог курсов</h1><p className="mt-2 text-muted-foreground">Выберите программу под возраст, уровень и ваши цели.</p></div><form className="grid gap-3 sm:grid-cols-3"><Input name="search" placeholder="Поиск по курсам" defaultValue={searchParams?.search} /><Select name="ageGroup" defaultValue={searchParams?.ageGroup ?? ''}><option value="">Все возрасты</option><option value="teen">12–17</option><option value="young">18–30</option><option value="adult">30–45</option></Select><Select name="level" defaultValue={searchParams?.level ?? ''}><option value="">Все уровни</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></Select><Button type="submit">Применить</Button></form></div><div className="mt-8 grid gap-6 lg:grid-cols-3">{courses.length ? courses.map((course) => <Card key={course.id}><CardHeader><Badge>{ageGroupLabel(course.ageGroup)}</Badge><CardTitle className="mt-4">{course.title}</CardTitle><CardDescription>{course.description}</CardDescription></CardHeader><CardContent><p className="mb-4 text-sm text-muted-foreground">{course.lessons.length} уроков · уровень {course.level}</p><Button asChild><Link href={`/courses/${course.slug}`}>Открыть</Link></Button></CardContent></Card>) : <Card className="lg:col-span-3"><CardContent className="pt-6 text-muted-foreground">Курсы не найдены. Попробуйте изменить фильтры.</CardContent></Card>}</div></Container>;
}
