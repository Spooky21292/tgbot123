import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Укажите имя'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
  ageGroup: z.enum(['teen', 'young', 'adult'])
});

export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Минимум 6 символов')
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Укажите имя'),
  email: z.string().email('Некорректный email'),
  message: z.string().min(10, 'Минимум 10 символов')
});

export const courseSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  ageGroup: z.enum(['teen', 'young', 'adult']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  coverImage: z.string().url(),
  isPublished: z.boolean().default(true)
});

export const webinarSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  speaker: z.string().min(2),
  date: z.string(),
  meetingUrl: z.string().url(),
  isPublished: z.boolean().default(true)
});

export const articleSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  excerpt: z.string().min(10),
  content: z.string().min(20),
  category: z.string().min(2),
  isPublished: z.boolean().default(true)
});
