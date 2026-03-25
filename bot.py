from __future__ import annotations

import logging

from telegram import Bot, Update
from telegram.error import InvalidToken, TelegramError
from telegram.ext import Application, CommandHandler, ContextTypes

from config import load_settings
from scheduler import DigestScheduler
from services.analysis_service import AnalysisService
from services.market_service import MarketService
from services.news_service import NewsService
from services.storage_service import StorageService


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


def build_application() -> tuple[Application, DigestScheduler, StorageService]:
    settings = load_settings()
    logging.getLogger().setLevel(settings.log_level.upper())

    storage = StorageService(settings.sqlite_db_path)
    news_service = NewsService(
        rss_feeds=settings.rss_feeds,
        max_items=settings.max_news_items,
        finnhub_api_key=settings.finnhub_api_key,
        newsapi_api_key=settings.newsapi_api_key,
    )
    market_service = MarketService()
    analysis_service = AnalysisService()

    app = Application.builder().token(settings.telegram_token).build()
    digest_scheduler = DigestScheduler(
        application=app,
        settings=settings,
        storage=storage,
        news_service=news_service,
        market_service=market_service,
        analysis_service=analysis_service,
    )

    async def start_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        if not update.effective_chat:
            return
        chat_id = update.effective_chat.id
        created = storage.subscribe(chat_id)
        if created:
            text = (
                "Вы подписаны на ежедневную финансовую сводку.\n"
                "Команды:\n"
                "/digest — получить сводку сейчас\n"
                "/ideas — идеи дня\n"
                "/stop — отписаться"
            )
        else:
            text = "Вы уже подписаны. Используйте /digest для ручного запуска сводки."
        await update.message.reply_text(text)

    async def stop_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        if not update.effective_chat:
            return
        removed = storage.unsubscribe(update.effective_chat.id)
        if removed:
            await update.message.reply_text("Вы отписались от ежедневной рассылки.")
        else:
            await update.message.reply_text("Вы не были подписаны. Для подписки используйте /start.")

    async def digest_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        await update.message.reply_text("Собираю свежие данные по рынкам и новостям...")
        digest = await digest_scheduler.build_digest()
        context.chat_data["latest_ideas"] = digest.ideas
        await update.message.reply_text(digest.summary_text)

    async def ideas_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        ideas = context.chat_data.get("latest_ideas")
        if not ideas:
            digest = await digest_scheduler.build_digest()
            ideas = digest.ideas
            context.chat_data["latest_ideas"] = ideas
        await update.message.reply_text(analysis_service.format_ideas_message(ideas))

    async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
        logger.exception("Unhandled error while processing update", exc_info=context.error)

    app.add_handler(CommandHandler("start", start_cmd))
    app.add_handler(CommandHandler("stop", stop_cmd))
    app.add_handler(CommandHandler("digest", digest_cmd))
    app.add_handler(CommandHandler("ideas", ideas_cmd))
    app.add_error_handler(error_handler)

    return app, digest_scheduler, storage


def _validate_token(token: str) -> bool:
    try:
        import asyncio

        asyncio.run(Bot(token).get_me())
        return True
    except InvalidToken:
        logger.error(
            "TELEGRAM_BOT_TOKEN отклонен Telegram API (401 Unauthorized). "
            "Проверьте токен в .env или перевыпустите его через BotFather."
        )
        return False
    except TelegramError:
        logger.exception("Не удалось проверить TELEGRAM_BOT_TOKEN из-за сетевой ошибки Telegram API")
        return False


def main() -> None:
    application, digest_scheduler, _ = build_application()
    if not _validate_token(application.bot.token):
        return

    digest_scheduler.start()
    logger.info("Bot is starting polling...")
    try:
        application.run_polling(close_loop=False)
    except InvalidToken:
        logger.error(
            "Остановка: TELEGRAM_BOT_TOKEN невалиден. "
            "Укажите корректный токен из BotFather и перезапустите приложение."
        )


if __name__ == "__main__":
    main()
