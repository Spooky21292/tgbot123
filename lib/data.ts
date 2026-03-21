import { db } from '@/lib/db';

export async function getHomePageData() {
  const [courses, webinars, articles, botFeatures] = await Promise.all([
    db.course.findMany({ where: { isPublished: true }, include: { lessons: true }, take: 3, orderBy: { createdAt: 'desc' } }),
    db.webinar.findMany({ where: { isPublished: true }, orderBy: { date: 'asc' }, take: 3 }),
    db.article.findMany({ where: { isPublished: true }, orderBy: { createdAt: 'desc' }, take: 3 }),
    db.botFeature.findMany()
  ]);
  return { courses, webinars, articles, botFeatures };
}

export async function getCourses(filters?: { ageGroup?: string; level?: string; search?: string }) {
  return db.course.findMany({
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
}

export async function getBlogPosts(search?: string) {
  return db.article.findMany({
    where: {
      isPublished: true,
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { excerpt: { contains: search } },
              { category: { contains: search } }
            ]
          }
        : {})
    },
    orderBy: { createdAt: 'desc' }
  });
}
