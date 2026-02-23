# StudyPing MVP 🤖

Простой Telegram-бот для напоминаний о домашке и делах.

## Что умеет
- Добавлять задачи с дедлайном.
- Показывать задачи на сегодня.
- Показывать список всех активных задач.
- Отмечать задачу выполненной или удалять.
- Присылать напоминания за 24 часа и за 2 часа до дедлайна.
- Присылать ежедневное напоминание по активным задачам (после заданного часа).

## 1) Создай бота в BotFather
1. Открой Telegram и найди `@BotFather`.
2. Отправь `/newbot`.
3. Введи имя и username бота.
4. BotFather пришлёт токен вида `123456:ABC...` — сохрани его.

## 2) Настрой окружение
Скопируй шаблон `.env.example` в `.env`:

```bash
cp .env.example .env
```

Заполни `.env`:
- `BOT_TOKEN` — токен от BotFather.
- `TIMEZONE` — таймзона (например, `Europe/Stockholm`).
- `DB_PATH` — путь к SQLite-файлу (по умолчанию `studyping.db`).
- `DAILY_REMINDER_HOUR` — час ежедневного напоминания (0-23, по умолчанию `9`).
- `ADMIN_ID` — Telegram ID администратора для команды `/stats`.
- `WEB_APP_URL` — ссылка на твой Telegram Mini App (HTTPS URL).

## 3) Установи зависимости
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 4) Запуск
```bash
python main.py
```

Бот запустится в режиме polling. SQLite база создастся автоматически.

---

## Команды бота
- `/start` — приветствие и кнопки.
- `/add` — пошаговое добавление задачи.
- `/today` — задачи на сегодня.
- `/list` — все активные задачи.
- `/help` — краткая справка.
- `/completed` — завершённые задачи.
- `/stats` — список пользователей (только админ).
- `/mini` — открыть Telegram Mini App.

## Формат дедлайна
Поддерживается 2 формата:
- `DD.MM` → время автоматически `18:00`
- `DD.MM HH:MM`

Год берётся текущий.

## Структура проекта
- `main.py` — входная точка, хендлеры и FSM.
- `db.py` — SQLite (таблица `tasks`, CRUD).
- `scheduler.py` — фоновая проверка напоминаний.
- `keyboards.py` — reply и inline кнопки.
- `config.py` — загрузка конфигурации из `.env`.
- `requirements.txt` — зависимости.
- `.env.example` — пример окружения.


## Telegram Mini App (хостинг на твоём сайте)
1. Залей папку `webapp/` на свой сайт (важно: HTTPS).
2. Укажи публичный URL в `.env`, например:
   `WEB_APP_URL=https://your-domain.com/studyping/index.html`
3. Перезапусти бота: `python main.py`.
4. В Telegram используй `/mini` или кнопку `🌐 Mini App`.

> В `webapp/` лежит базовый шаблон Mini App, который можно доработать под твой UI/логику.
