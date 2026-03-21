import { z } from 'zod';

const requiredText = (message: string, min = 1) =>
  z.string({ required_error: message }).trim().min(min, message);

export const registerSchema = z.object({
  name: requiredText('Укажите имя', 2),
  email: requiredText('Укажите email').email('Некорректный email'),
  password: requiredText('Укажите пароль', 6),
  ageGroup: z.enum(['teen', 'young', 'adult'], {
    required_error: 'Выберите возрастную группу'
  })
});

export const loginSchema = z.object({
  email: requiredText('Укажите email').email('Некорректный email'),
  password: requiredText('Укажите пароль', 6)
});

export const contactSchema = z.object({
  name: requiredText('Укажите имя', 2),
  email: requiredText('Укажите email').email('Некорректный email'),
  message: requiredText('Введите сообщение', 10)
});

export const courseSchema = z.object({
  title: requiredText('Укажите название', 3),
  slug: requiredText('Укажите slug', 3),
  description: requiredText('Укажите описание', 10),
  ageGroup: z.enum(['teen', 'young', 'adult']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  coverImage: z.string().url('Введите корректный URL'),
  isPublished: z.boolean().default(true)
});

export const webinarSchema = z.object({
  title: requiredText('Укажите название', 3),
  description: requiredText('Укажите описание', 10),
  speaker: requiredText('Укажите спикера', 2),
  date: requiredText('Укажите дату'),
  meetingUrl: z.string().url('Введите корректный URL'),
  isPublished: z.boolean().default(true)
});

export const articleSchema = z.object({
  title: requiredText('Укажите название', 3),
  slug: requiredText('Укажите slug', 3),
  excerpt: requiredText('Укажите краткое описание', 10),
  content: requiredText('Добавьте контент', 20),
  category: requiredText('Укажите категорию', 2),
  isPublished: z.boolean().default(true)
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
