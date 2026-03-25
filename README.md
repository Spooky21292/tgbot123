# Financial Digest Telegram Bot (OpenRouter + Python)

Production-ready MVP Telegram-бот с ежедневной финансовой сводкой:
- собирает новости (RSS),
- подтягивает рыночные данные (yfinance),
- генерирует структурированный дайджест через OpenRouter,
- рассылает подписчикам 1 раз в день через APScheduler.

## 1) Получение TELEGRAM_BOT_TOKEN
1. Откройте `@BotFather` в Telegram.
2. Выполните `/newbot`.
3. Скопируйте токен вида `123456789:ABC...`.
4. Вставьте в `TELEGRAM_BOT_TOKEN`.

## 2) Получение OPENROUTER_API_KEY
1. Зарегистрируйтесь на [OpenRouter](https://openrouter.ai/).
2. Перейдите в раздел API Keys.
3. Создайте ключ.
4. Вставьте его в `OPENROUTER_API_KEY`.

> По умолчанию используется бесплатная модель: `deepseek/deepseek-chat:free`.

## 3) Локальный запуск

### Требования
- Python 3.11+

### Шаги
```bash
cp .env.example .env
# заполните токены в .env

python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

python -m app.main
```

При старте бот:
- выводит путь к `.env`,
- показывает факт загрузки токенов (без вывода самих токенов),
- выполняет проверку Telegram API через `getMe`.

## 4) Деплой на Railway
1. Создайте новый проект Railway и подключите GitHub-репозиторий.
2. В `Variables` добавьте:
   - `TELEGRAM_BOT_TOKEN`
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_MODEL` (опционально)
   - `DIGEST_HOUR_UTC`, `DIGEST_MINUTE_UTC`
   - `REQUEST_TIMEOUT_SECONDS` (опционально)
   - `RSS_FEEDS` (опционально)
3. Команда запуска:
   ```bash
   python -m app.main
   ```

Важно: в production бот читает значения через `os.getenv`; `.env` нужен только для локальной разработки.

## 5) Проверка работоспособности
После запуска в Telegram:
- `/start` — подписка
- `/status` — статус бота
- `/digest` — отправка сводки вручную
- `/stop` — отписка

Если OpenRouter или внешние API временно недоступны, бот отправит fallback-сообщение и не упадет.

## Команды
- `/start`
- `/stop`
- `/digest`
- `/status`

## Формат сводки
1. Новости
2. Рынки
3. Идеи (не советы)
4. Риски
5. Сценарии

В конце всегда добавляется:
`⚠️ Это не инвестиционная рекомендация`
