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

  if (!filters?.ageGroup && filters?.preferredAgeGroup) {
    return courses.sort((a, b) => {
      const aScore = a.ageGroup === filters.preferredAgeGroup ? 1 : 0;
      const bScore = b.ageGroup === filters.preferredAgeGroup ? 1 : 0;
      return bScore - aScore;
    });
  }

  return courses;
}

export async function getBlogPosts(filters?: { search?: string; category?: string }) {
  return db.article.findMany({
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
}

export async function getBlogCategories() {
  const categories = await db.article.findMany({
    where: { isPublished: true },
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' }
  });

  return categories.map((item) => item.category);
}
