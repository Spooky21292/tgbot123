from __future__ import annotations

import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from telegram.ext import Application

from config import Settings
from services.analysis_service import AnalysisService, DigestResult
from services.market_service import MarketService
from services.news_service import NewsService
from services.storage_service import StorageService


logger = logging.getLogger(__name__)


class DigestScheduler:
    def __init__(
        self,
        application: Application,
        settings: Settings,
        storage: StorageService,
        news_service: NewsService,
        market_service: MarketService,
        analysis_service: AnalysisService,
    ) -> None:
        self.application = application
        self.settings = settings
        self.storage = storage
        self.news_service = news_service
        self.market_service = market_service
        self.analysis_service = analysis_service
        self.scheduler = AsyncIOScheduler(timezone=settings.timezone)

    def start(self) -> None:
        self.scheduler.add_job(
            self.send_daily_digest,
            trigger=CronTrigger(
                hour=self.settings.digest_hour,
                minute=self.settings.digest_minute,
                timezone=self.settings.timezone,
            ),
            id="daily_digest",
            replace_existing=True,
        )
        self.scheduler.start()
        logger.info(
            "Scheduler started. Daily digest at %02d:%02d %s",
            self.settings.digest_hour,
            self.settings.digest_minute,
            self.settings.timezone,
        )

    async def send_daily_digest(self) -> None:
        subscribers = self.storage.list_subscribers()
        if not subscribers:
            logger.info("No subscribers for daily digest")
            return

        digest = await self.build_digest()
        for sub in subscribers:
            try:
                await self.application.bot.send_message(chat_id=sub.chat_id, text=digest.summary_text)
            except Exception:
                logger.exception("Failed to send digest to chat_id=%s", sub.chat_id)

    async def build_digest(self) -> DigestResult:
        news = self.news_service.fetch_recent_news(hours=24)
        market = self.market_service.fetch_market_data()
        return self.analysis_service.build_digest(news, market)
