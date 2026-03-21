import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await db.article.findUnique({ where: { slug: params.slug } });
  return { title: article?.title ?? 'Статья', description: article?.excerpt };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await db.article.findUnique({ where: { slug: params.slug } });
  if (!article) notFound();
  return <Container className="py-12"><Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Блог', href: '/blog' }, { label: article.title }]} /><article className="prose-finance mx-auto max-w-3xl"><h1 className="text-4xl font-semibold">{article.title}</h1><p className="mt-4 text-lg text-muted-foreground">{article.excerpt}</p><div className="mt-8 whitespace-pre-wrap rounded-3xl border p-8">{article.content}</div></article></Container>;
}
