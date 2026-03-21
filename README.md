# FinSkills Pro

FinSkills Pro — production-like MVP онлайн-школы по финансовой грамотности и экономике для пользователей 12–17, 18–25 и 26+. Проект построен на Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma и NextAuth.

## Что внутри
- Главная страница с позиционированием, преимуществами и CTA.
- Каталог курсов с фильтрами и поиском.
- Страницы курсов и уроков с видео, текстом и квизами.
- Личный кабинет с прогрессом, тарифами и рекомендациями.
- Демо-трейдинг `/trade` с виртуальным балансом, watchlist, позициями, историей сделок и страницами активов.
- Telegram-бот как образовательный ассистент с mock UI.
- Вебинары, блог, контакты и базовая админ-панель.
- Prisma schema, seed-данные, middleware защиты маршрутов, API routes.

## Технологии
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite по умолчанию
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
MARKET_DATA_PROVIDER="demo"
MARKET_DATA_API_KEY=""
DEMO_TRADING_START_BALANCE="100000"
```

### Market data provider
По умолчанию проект использует `demo`-provider — этого достаточно для локальной проверки симулятора без ключей. Для подключения внешних рыночных данных:
- `MARKET_DATA_PROVIDER="alphavantage"` и `MARKET_DATA_API_KEY="..."`
- или `MARKET_DATA_PROVIDER="twelvedata"` и `MARKET_DATA_API_KEY="..."`

Секреты никогда не передаются на клиент: котировки и свечи идут только через серверные route handlers.

## Демо-трейдинг
Новый учебный модуль `/trade` — это **симулятор**, а не брокер.

Что умеет:
- автоматически создаёт пользователю демо-счёт;
- стартует с виртуального баланса `100000`;
- показывает watchlist активов (`AAPL`, `TSLA`, `NVDA`, `BTC/USD`, `ETH/USD`, `EUR/USD`);
- отображает текущие котировки и историю цен через market-data abstraction;
- позволяет покупать и продавать активы на виртуальные деньги;
- считает позиции, среднюю цену входа, unrealized/realized PnL;
- хранит сделки и позволяет сбросить демо-счёт.

### Важно
- нет депозитов;
- нет выводов средств;
- нет реального исполнения ордеров;
- нет брокерской интеграции;
- это только образовательный тренажёр.

## Seed-данные
После `npm run db:seed` будут созданы:
- 1 admin: `admin@finskills.pro` / `password123`
- 3 пользователя: `teen@finskills.pro`, `young@finskills.pro`, `adult@finskills.pro` / `password123`
- 3 курса, уроки, квизы, 3 вебинара, 5 статей, bot features
- demo trading assets и демо-счета для пользователей
- пример позиций и сделок у одного demo-user для красивого first-run UX

## Сборка production
```bash
npm run build
npm run start
```

## Структура проекта
- `app` — страницы, маршруты и API
- `components` — UI, формы, layout и trading/dashboard-компоненты
- `lib` — auth, prisma, util, market/trading services
- `prisma` — schema и seed
- `types` — типы NextAuth

## Демо-сценарий
1. Зарегистрируйтесь или войдите демо-пользователем.
2. Пройдите курс или урок.
3. Откройте `/trade` и посмотрите стартовый виртуальный счёт.
4. Выберите актив, откройте `/trade/[symbol]` и выполните демо-покупку или продажу.
5. Вернитесь на `/trade`, чтобы посмотреть позиции, PnL и историю сделок.
