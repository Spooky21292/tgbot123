# Financial Digest Telegram Bot (OpenRouter + Python)

Production-like MVP Telegram-бот с ежедневной финансовой сводкой:
- новости из RSS,
- рыночные данные через yfinance,
- генерация аналитического текста через OpenRouter,
- ежедневная рассылка подписчикам через APScheduler.

## Структура проекта

```text
project/
  app/
    __init__.py
    main.py
    bot.py
    config.py
    logger.py
    scheduler.py
    services/
      __init__.py
      ai_service.py
      analysis_service.py
      market_service.py
      news_service.py
      storage_service.py
  .env.example
  requirements.txt
  README.md
```

## 1) Как получить токены

### TELEGRAM_BOT_TOKEN
1. Откройте `@BotFather`.
2. Создайте бота (`/newbot`) или выберите существующего (`/mybots`).
3. Возьмите API token.

### OPENROUTER_API_KEY
1. Зарегистрируйтесь на https://openrouter.ai/
2. Создайте API key.
3. Вставьте ключ в `.env`.

## 2) Локальный запуск на Windows

### Создать venv
```powershell
py -3.11 -m venv .venv
```

### Активировать venv
```powershell
.venv\Scripts\Activate.ps1
```

### Установить зависимости
```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Заполнить .env
```powershell
copy .env.example .env
```
Откройте `.env` и задайте:
- `TELEGRAM_BOT_TOKEN`
- `OPENROUTER_API_KEY`

### Запустить бота (правильная команда)
```powershell
python -m app.main
```

> Не запускайте `python app/bot.py`. Точка входа проекта: `app.main`.

## 3) Проверка токена Telegram через getMe

В проекте это делается автоматически при старте (`test_telegram_token`).

Ручная проверка:
```text
https://api.telegram.org/bot<YOUR_TOKEN>/getMe
```

Если получаете `401 Unauthorized`:
- токен неверный или отозван,
- перевыпустите токен через `@BotFather`,
- обновите `.env`,
- перезапустите бота.

## 4) Railway deploy
1. Подключите репозиторий к Railway.
2. В `Variables` добавьте:
   - `TELEGRAM_BOT_TOKEN`
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_MODEL` (опционально)
   - `DIGEST_HOUR_UTC`, `DIGEST_MINUTE_UTC`
   - `REQUEST_TIMEOUT_SECONDS` (опционально)
   - `RSS_FEEDS` (опционально)
3. Start command:
```bash
python -m app.main
```

## 5) Команды в Telegram
- `/start` — подписка
- `/stop` — отписка
- `/status` — статус
- `/digest` — отправить сводку вручную

## 6) Надежность конфигурации
- `.env` загружается из корня проекта через `pathlib`.
- Переменные окружения Railway имеют приоритет (dotenv не перезаписывает уже заданные env).
- Токены чистятся от пробелов/кавычек/переносов.
- Логируются путь к `.env` и длины токенов (без вывода секретов).
