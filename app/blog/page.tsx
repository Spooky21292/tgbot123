import type { Metadata } from 'next';
import Link from 'next/link';
import { getBlogPosts } from '@/lib/data';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const metadata: Metadata = { title: 'Блог', description: 'Статьи о бюджете, инфляции, налогах и привычках' };

export default async function BlogPage({ searchParams }: { searchParams?: { search?: string } }) {
  const posts = await getBlogPosts(searchParams?.search);
  return <Container className="py-12"><Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Блог' }]} /><div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><h1 className="text-4xl font-semibold">Блог и статьи</h1><p className="mt-2 text-muted-foreground">Понятные материалы по темам финансовой грамотности.</p></div><form><Input name="search" placeholder="Поиск по статьям" defaultValue={searchParams?.search} /></form></div><div className="mt-8 grid gap-6 lg:grid-cols-3">{posts.length ? posts.map((post) => <Card key={post.id}><CardHeader><CardTitle>{post.title}</CardTitle><CardDescription>{post.excerpt}</CardDescription></CardHeader><CardContent><p className="mb-4 text-sm text-muted-foreground">Категория: {post.category}</p><Button asChild><Link href={`/blog/${post.slug}`}>Читать</Link></Button></CardContent></Card>) : <Card className="lg:col-span-3"><CardContent className="pt-6 text-muted-foreground">По вашему запросу статьи не найдены.</CardContent></Card>}</div></Container>;
}
