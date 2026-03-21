# FinSkills Pro

FinSkills Pro — production-like MVP онлайн-школы по финансовой грамотности и экономике для пользователей 12–45 лет. Проект построен на Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma и NextAuth.

## Что внутри
- Главная страница с позиционированием, преимуществами, FAQ и CTA.
- Каталог курсов с фильтрами и поиском.
- Страницы курсов и уроков с видео, текстом и квизами.
- Личный кабинет с прогрессом, графиком Recharts и рекомендациями.
- Telegram-бот как образовательный ассистент с mock UI.
- Вебинары, блог, контакты, тарифы и базовая админ-панель.
- Prisma schema, seed-данные, middleware защиты маршрутов, API routes.

## Технологии
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- Prisma ORM
- SQLite по умолчанию (можно переключить на PostgreSQL)
- NextAuth Credentials
- React Hook Form + Zod
- Recharts
- bcryptjs
- sonner, lucide-react, next-themes

## Установка
```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Откройте http://localhost:3000.

## Переменные окружения
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="change-me-super-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### Как перейти на PostgreSQL
1. Измените `datasource db` в `prisma/schema.prisma` на `provider = "postgresql"`.
2. Укажите строку подключения PostgreSQL в `DATABASE_URL`.
3. Выполните `npm run db:push` или `npm run db:migrate`.

## Seed-данные
После `npm run db:seed` будут созданы:
- 1 admin: `admin@finskills.pro` / `password123`
- 3 пользователя: `teen@finskills.pro`, `young@finskills.pro`, `adult@finskills.pro` / `password123`
- 3 курса, уроки, квизы, 3 вебинара, 5 статей, bot features.

## Запуск миграций
```bash
npm run db:migrate
```

## Локальный запуск
```bash
npm run dev
```

## Сборка production
```bash
npm run build
npm run start
```

## Структура проекта
- `app` — страницы, маршруты и API
- `components` — UI, формы, layout и dashboard-компоненты
- `lib` — auth, prisma, util, validations
- `prisma` — schema и seed
- `types` — типы NextAuth
- `public` — публичные ресурсы
- `hooks` — место для кастомных хуков

## Демо-сценарий
1. Зарегистрируйтесь или войдите демо-пользователем.
2. Откройте курс, завершите урок и пройдите квиз.
3. Перейдите в dashboard и посмотрите прогресс.
4. Войдите под админом, чтобы увидеть обзор сущностей в `/admin`.
