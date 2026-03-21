import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { isFreeBlogSlug } from '@/lib/content-access';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await db.article.findUnique({ where: { slug: params.slug } });
  return { title: article?.title ?? 'Статья', description: article?.excerpt };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user && !isFreeBlogSlug(params.slug)) redirect('/auth/register');

  const article = await db.article.findUnique({ where: { slug: params.slug } });
  if (!article) notFound();

  return (
    <Container className="py-12">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Блог', href: '/blog' }, { label: article.title }]} />
      <article className="prose-finance mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold">{article.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{article.excerpt}</p>
        <div className="mt-8 whitespace-pre-wrap rounded-3xl border p-8">{article.content}</div>
      </article>
    </Container>
  );
}
