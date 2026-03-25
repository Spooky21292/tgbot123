from __future__ import annotations

import os
from dataclasses import dataclass
from datetime import time
from typing import Optional

from dotenv import load_dotenv

load_dotenv()


@dataclass(slots=True)
class Settings:
    telegram_token: str
    timezone: str
    digest_hour: int
    digest_minute: int
    sqlite_db_path: str
    log_level: str
    rss_feeds: list[str]
    finnhub_api_key: Optional[str]
    newsapi_api_key: Optional[str]
    max_news_items: int

    @property
    def digest_time(self) -> time:
        return time(hour=self.digest_hour, minute=self.digest_minute)


DEFAULT_RSS_FEEDS = [
    "https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best",
    "https://feeds.bloomberg.com/markets/news.rss",
    "https://www.investing.com/rss/news.rss",
    "https://www.cnbc.com/id/100003114/device/rss/rss.html",
]


def _int_env(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None:
        return default
    try:
        return int(raw)
    except ValueError:
        return default


def load_settings() -> Settings:
    token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    if not token:
        raise RuntimeError("TELEGRAM_BOT_TOKEN is required")

    feeds = os.getenv("RSS_FEEDS", "")
    rss_feeds = [f.strip() for f in feeds.split(",") if f.strip()] if feeds else DEFAULT_RSS_FEEDS

    return Settings(
        telegram_token=token,
        timezone=os.getenv("TIMEZONE", "UTC"),
        digest_hour=_int_env("DIGEST_HOUR", 8),
        digest_minute=_int_env("DIGEST_MINUTE", 0),
        sqlite_db_path=os.getenv("SQLITE_DB_PATH", "bot_data.db"),
        log_level=os.getenv("LOG_LEVEL", "INFO"),
        rss_feeds=rss_feeds,
        finnhub_api_key=os.getenv("FINNHUB_API_KEY"),
        newsapi_api_key=os.getenv("NEWSAPI_API_KEY"),
        max_news_items=_int_env("MAX_NEWS_ITEMS", 12),
    )
