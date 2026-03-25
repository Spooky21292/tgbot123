# Financial Digest Telegram Bot (OpenRouter + Python)

Production-like MVP Telegram-бот с ежедневной финансовой сводкой:
- новости из RSS,
- рыночные данные через yfinance,
- генерация аналитического текста через OpenRouter,
- ежедневная рассылка подписчикам через APScheduler.

## Важно
Проект работает **без `.env`**. Только системные переменные окружения.

## 1) Как получить токены

### TELEGRAM_BOT_TOKEN
1. Откройте `@BotFather`.
2. Создайте бота (`/newbot`) или выберите существующего (`/mybots`).
3. Возьмите API token.

### OPENROUTER_API_KEY
1. Зарегистрируйтесь на https://openrouter.ai/
2. Создайте API key.
3. Для бесплатной модели используйте `deepseek/deepseek-chat:free`.

## 2) Локальный запуск на Windows (без .env)

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

### Установить переменные окружения на текущую сессию PowerShell
```powershell
$env:TELEGRAM_BOT_TOKEN = "123456789:REPLACE_ME"
$env:OPENROUTER_API_KEY = "sk-or-v1-REPLACE_ME"
$env:OPENROUTER_MODEL = "deepseek/deepseek-chat:free"
$env:OPENROUTER_SITE_URL = "https://your-site.example"   # optional
$env:OPENROUTER_APP_NAME = "finance-digest-bot"          # optional
$env:DIGEST_HOUR_UTC = "7"
$env:DIGEST_MINUTE_UTC = "0"
```

### Запуск
```powershell
python -m app.main
```

## 3) Проверка токена Telegram (getMe)
Автоматически выполняется при старте. Ручная проверка:
```text
https://api.telegram.org/bot<YOUR_TOKEN>/getMe
```

Если `401 Unauthorized`:
- токен неверный/отозван,
- перевыпустите через `@BotFather`,
- обновите переменную `TELEGRAM_BOT_TOKEN`,
- перезапустите процесс.

## 4) Railway deploy
1. Подключите репозиторий к Railway.
2. В Variables добавьте:
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

## 5) Команды
- `/start`
- `/stop`
- `/status`
- `/digest`


## 6) OpenRouter интеграция
Проект использует OpenRouter Quickstart-схему для прямого API-запроса:
- `POST https://openrouter.ai/api/v1/chat/completions`
- заголовок `Authorization: Bearer <OPENROUTER_API_KEY>`
- optional headers: `HTTP-Referer`, `X-OpenRouter-Title`
- модель по умолчанию: `deepseek/deepseek-chat:free`

В коде есть retry + timeout + fallback, если API временно недоступен.
