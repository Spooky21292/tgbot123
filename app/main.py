from __future__ import annotations

import asyncio
import logging

import requests
from telegram.ext import Application

from app.bot import FinanceDigestBot
from app.config import load_settings
from app.logger import setup_logger
from app.scheduler import DigestScheduler
from app.services.ai_service import AIService
from app.services.analysis_service import AnalysisService
from app.services.market_service import MarketService
from app.services.news_service import NewsService
from app.services.storage_service import StorageService

logger = logging.getLogger(__name__)


def test_telegram_token(token: str, timeout_seconds: int) -> None:
    cleaned_token = token.strip()
    logger.info("Telegram token length for getMe check: %d", len(cleaned_token))
    url = f"https://api.telegram.org/bot{cleaned_token}/getMe"
    try:
        response = requests.get(url, timeout=timeout_seconds)
    except requests.RequestException as exc:
        raise RuntimeError(
            "Telegram API is unreachable. Check internet/proxy/firewall and retry."
        ) from exc

    if response.status_code == 401:
        raise ValueError(
            "Telegram returned 401 Unauthorized for getMe. "
            "Your TELEGRAM_BOT_TOKEN is invalid/revoked. "
            "Generate a fresh token in @BotFather and update .env / Railway Variables."
        )

    try:
        response.raise_for_status()
    except requests.HTTPError as exc:
        raise RuntimeError(
            f"Telegram getMe failed with status {response.status_code}: {response.text[:300]}"
        ) from exc

    body = response.json()
    if not body.get("ok"):
        raise RuntimeError(f"Telegram getMe failed: {body}")
    username = body.get("result", {}).get("username", "unknown")
    logger.info("Telegram API check passed. Bot username: @%s", username)


async def run() -> None:
    setup_logger()
    settings = load_settings()

    print("Environment source: system variables only (.env disabled)")
    print(f"TELEGRAM_BOT_TOKEN loaded: {'yes' if settings.telegram_bot_token else 'no'}")
    print(f"OPENROUTER_API_KEY loaded: {'yes' if settings.openrouter_api_key else 'no'}")

    test_telegram_token(settings.telegram_bot_token, settings.request_timeout_seconds)

    application = Application.builder().token(settings.telegram_bot_token).build()

    storage_service = StorageService(settings.database_path)
    news_service = NewsService(settings.rss_feeds)
    market_service = MarketService()
    ai_service = AIService(
        api_key=settings.openrouter_api_key,
        model=settings.openrouter_model,
        timeout_seconds=settings.request_timeout_seconds,
    )
    analysis_service = AnalysisService(news_service, market_service, ai_service)

    bot = FinanceDigestBot(application, storage_service, analysis_service)
    bot.attach_handlers()

    scheduler = DigestScheduler(bot, settings)
    scheduler.start()

    try:
        await application.initialize()
        await application.start()
        await application.updater.start_polling()
        logger.info("Bot started and polling...")

        while True:
            await asyncio.sleep(3600)
    finally:
        scheduler.stop()
        await application.updater.stop()
        await application.stop()
        await application.shutdown()


if __name__ == "__main__":
    asyncio.run(run())
