import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { getBlogPosts } from '@/lib/data';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authOptions } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { isFreeBlogSlug } from '@/lib/content-access';

export const metadata: Metadata = { title: 'Блог', description: 'Статьи о бюджете, инфляции, налогах и привычках' };

const blogTopics = ['бюджет', 'налоги', 'семейные финансы', 'сбережения', 'инфляция', 'безопасность', 'инвестиции', 'финансовые привычки', 'карьера'];

export default async function BlogPage({ searchParams }: { searchParams?: { search?: string; topic?: string } }) {
  const query = [searchParams?.search, searchParams?.topic].filter(Boolean).join(' ').trim();
  const [posts, session] = await Promise.all([
    getBlogPosts({ search: query || undefined }),
    getServerSession(authOptions)
  ]);
  const articleHref = (slug: string) => session?.user || isFreeBlogSlug(slug) ? `/blog/${slug}` : '/auth/register';

  return (
    <Container className="py-10 sm:py-12">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Блог' }]} />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Блог</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">Большая библиотека развёрнутых материалов по бюджету, безопасности, карьере, семейным финансам и инвестиционному мышлению.</p>
        </div>
        <form className="grid w-full gap-3 rounded-2xl border border-border/80 bg-card p-4 lg:max-w-2xl lg:grid-cols-[minmax(320px,1fr)_160px]">
          <Input name="search" placeholder="Поиск по статьям" defaultValue={searchParams?.search} className="min-w-[260px]" />
          <Button type="submit" className="w-full">Применить</Button>
        </form>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {blogTopics.map((topic) => (
          <Button key={topic} variant={searchParams?.topic === topic ? 'secondary' : 'outline'} size="sm" asChild>
            <Link href={`/blog?topic=${encodeURIComponent(topic)}`}>{topic}</Link>
          </Button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {posts.length ? posts.map((post) => (
          <Card key={post.id} className="flex h-full flex-col">
            <CardHeader className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="w-fit">{post.category}</Badge>
                {isFreeBlogSlug(post.slug) ? <Badge variant="outline">Бесплатно</Badge> : null}
              </div>
              <CardTitle className="mt-3">{post.title}</CardTitle>
              <CardDescription>{post.excerpt}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto flex flex-col">
              <p className="mb-4 text-sm text-muted-foreground">Развёрнутый материал с примерами, структурой и практическими выводами.</p>
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
