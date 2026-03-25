from __future__ import annotations

import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.bot import FinanceDigestBot
from app.config import Settings

logger = logging.getLogger(__name__)


class DigestScheduler:
    def __init__(self, bot: FinanceDigestBot, settings: Settings) -> None:
        self.bot = bot
        self.settings = settings
        self.scheduler = AsyncIOScheduler(timezone="UTC")

    def start(self) -> None:
        trigger = CronTrigger(
            hour=self.settings.digest_hour_utc,
            minute=self.settings.digest_minute_utc,
            timezone="UTC",
        )
        self.scheduler.add_job(
            self.bot.send_digest_to_subscribers,
            trigger=trigger,
            id="daily_finance_digest",
            replace_existing=True,
            misfire_grace_time=300,
        )
        self.scheduler.start()
        logger.info(
            "Scheduler started. Daily digest at %02d:%02d UTC",
            self.settings.digest_hour_utc,
            self.settings.digest_minute_utc,
        )

    def stop(self) -> None:
        self.scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped")
