import { db } from '@/lib/db';
import { isFreeBlogSlug } from '@/lib/content-access';

export async function getHomePageData() {
  const [courses, webinars, articles, botFeatures] = await Promise.all([
    db.course.findMany({ where: { isPublished: true }, include: { lessons: true }, take: 3, orderBy: { createdAt: 'desc' } }),
    db.webinar.findMany({ where: { isPublished: true }, orderBy: { date: 'asc' }, take: 3 }),
    db.article.findMany({ where: { isPublished: true }, orderBy: { createdAt: 'desc' }, take: 3 }),
    db.botFeature.findMany()
  ]);
  return { courses, webinars, articles, botFeatures };
}

export async function getCourses(filters?: { ageGroup?: string; level?: string; search?: string; preferredAgeGroup?: string }) {
  const courses = await db.course.findMany({
    where: {
      isPublished: true,
      ...(filters?.ageGroup ? { ageGroup: filters.ageGroup as never } : {}),
      ...(filters?.level ? { level: filters.level as never } : {}),
      ...(filters?.search
        ? {
            OR: [
              { title: { contains: filters.search } },
              { description: { contains: filters.search } }
            ]
          }
        : {})
    },
    include: { lessons: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'desc' }
  });

  return courses.sort((a, b) => {
    const premiumScore = Number(a.isPremium) - Number(b.isPremium);
    if (premiumScore !== 0) return premiumScore;

    const aAgeScore = !filters?.ageGroup && filters?.preferredAgeGroup && a.ageGroup === filters.preferredAgeGroup ? 1 : 0;
    const bAgeScore = !filters?.ageGroup && filters?.preferredAgeGroup && b.ageGroup === filters.preferredAgeGroup ? 1 : 0;
    if (aAgeScore !== bAgeScore) return bAgeScore - aAgeScore;

    return a.title.localeCompare(b.title, 'ru');
  });
}

export async function getBlogPosts(filters?: { search?: string; category?: string }) {
  const posts = await db.article.findMany({
    where: {
      isPublished: true,
      ...(filters?.category ? { category: filters.category } : {}),
      ...(filters?.search
        ? {
            OR: [
              { title: { contains: filters.search } },
              { excerpt: { contains: filters.search } },
              { category: { contains: filters.search } }
            ]
          }
        : {})
    },
    orderBy: { createdAt: 'desc' }
  });

  return posts.sort((a, b) => {
    const freeScore = Number(isFreeBlogSlug(a.slug)) - Number(isFreeBlogSlug(b.slug));
    if (freeScore !== 0) return freeScore * -1;
    return a.title.localeCompare(b.title, 'ru');
  });
}
