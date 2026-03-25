from __future__ import annotations

import asyncio
import logging

import requests
from telegram.ext import Application

from app.bot import FinanceDigestBot
from app.config import ENV_PATH, load_settings
from app.logger import setup_logger
from app.scheduler import DigestScheduler
from app.services.ai_service import AIService
from app.services.analysis_service import AnalysisService
from app.services.market_service import MarketService
from app.services.news_service import NewsService
from app.services.storage_service import StorageService

logger = logging.getLogger(__name__)


def test_telegram_token(token: str, timeout_seconds: int) -> None:
    url = f"https://api.telegram.org/bot{token}/getMe"
    response = requests.get(url, timeout=timeout_seconds)
    response.raise_for_status()
    body = response.json()
    if not body.get("ok"):
        raise ValueError(f"Telegram getMe failed: {body}")
    username = body.get("result", {}).get("username", "unknown")
    logger.info("Telegram API check passed. Bot username: @%s", username)


async def run() -> None:
    setup_logger()
    settings = load_settings()

    print(f"ENV path: {ENV_PATH}")
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
    try:
        asyncio.run(run())
    except Exception as exc:
        logging.exception("Fatal startup error: %s", exc)
        raise
