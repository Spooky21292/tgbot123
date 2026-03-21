import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { getBlogCategories, getBlogPosts } from '@/lib/data';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { authOptions } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Блог', description: 'Статьи о бюджете, инфляции, налогах и привычках' };

export default async function BlogPage({ searchParams }: { searchParams?: { search?: string; category?: string } }) {
  const [posts, categories, session] = await Promise.all([
    getBlogPosts({ search: searchParams?.search, category: searchParams?.category }),
    getBlogCategories(),
    getServerSession(authOptions)
  ]);
  const articleHref = (slug: string) => session?.user ? `/blog/${slug}` : '/auth/register';

  return (
    <Container className="py-10 sm:py-12">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Блог' }]} />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Блог</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">Большая библиотека материалов по бюджету, привычкам, безопасности и спокойным инвестиционным решениям.</p>
        </div>
        <form className="grid w-full gap-3 rounded-2xl border border-border/80 bg-card p-4 sm:grid-cols-[minmax(220px,1.4fr)_minmax(180px,0.9fr)_minmax(150px,auto)] lg:max-w-3xl">
          <Input name="search" placeholder="Поиск по статьям" defaultValue={searchParams?.search} className="min-w-[220px]" />
          <Select name="category" defaultValue={searchParams?.category ?? ''} className="min-w-[180px]">
            <option value="">Все категории</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Select>
          <Button type="submit" className="w-full">Применить</Button>
        </form>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant={!searchParams?.category ? 'secondary' : 'outline'} size="sm" asChild>
          <Link href="/blog">Все темы</Link>
        </Button>
        {categories.map((category) => (
          <Button key={category} variant={searchParams?.category === category ? 'secondary' : 'outline'} size="sm" asChild>
            <Link href={`/blog?category=${encodeURIComponent(category)}`}>{category}</Link>
          </Button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {posts.length ? posts.map((post) => (
          <Card key={post.id} className="flex h-full flex-col">
            <CardHeader className="flex-1">
              <Badge className="w-fit">{post.category}</Badge>
              <CardTitle className="mt-3">{post.title}</CardTitle>
              <CardDescription>{post.excerpt}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto flex flex-col">
              <p className="mb-4 text-sm text-muted-foreground">Материал для вдумчивого чтения и практических выводов.</p>
              <Button className="self-start" asChild>
                <Link href={articleHref(post.slug)}>Читать</Link>
              </Button>
            </CardContent>
          </Card>
        )) : <Card className="lg:col-span-3"><CardContent className="pt-6 text-muted-foreground">По вашему запросу статьи не найдены.</CardContent></Card>}
      </div>
    </Container>
  );
}
