from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

# Railway/production can pass ENV directly.
# Local development uses .env from project root.
load_dotenv(ENV_PATH)


def _clean_secret(value: str | None) -> str:
    if value is None:
        return ""
    cleaned = value.strip().strip('"').strip("'").strip()
    cleaned = cleaned.replace("\n", "").replace("\r", "").strip()
    return cleaned


@dataclass(frozen=True)
class Settings:
    telegram_bot_token: str
    openrouter_api_key: str
    openrouter_model: str
    digest_hour_utc: int
    digest_minute_utc: int
    database_path: Path
    request_timeout_seconds: int
    rss_feeds: list[str]



def load_settings() -> Settings:
    telegram_bot_token = _clean_secret(os.getenv("TELEGRAM_BOT_TOKEN"))
    openrouter_api_key = _clean_secret(os.getenv("OPENROUTER_API_KEY"))

    logger.info("ENV path: %s", ENV_PATH)
    logger.info("TELEGRAM_BOT_TOKEN length: %d", len(telegram_bot_token))
    logger.info("OPENROUTER_API_KEY length: %d", len(openrouter_api_key))

    if not telegram_bot_token:
        raise ValueError(
            "TELEGRAM_BOT_TOKEN is empty. Check .env path, Railway Variables, and token formatting."
        )
    if not openrouter_api_key:
        raise ValueError(
            "OPENROUTER_API_KEY is empty. Check .env path, Railway Variables, and key formatting."
        )

    openrouter_model = (
        _clean_secret(os.getenv("OPENROUTER_MODEL"))
        or "deepseek/deepseek-chat:free"
    )

    digest_hour_utc = int(os.getenv("DIGEST_HOUR_UTC", "7"))
    digest_minute_utc = int(os.getenv("DIGEST_MINUTE_UTC", "0"))
    request_timeout_seconds = int(os.getenv("REQUEST_TIMEOUT_SECONDS", "30"))

    raw_feeds = os.getenv(
        "RSS_FEEDS",
        "https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best," \
        "https://feeds.a.dj.com/rss/RSSMarketsMain.xml," \
        "https://www.investing.com/rss/news_25.rss",
    )
    rss_feeds = [item.strip() for item in raw_feeds.split(",") if item.strip()]

    database_path = BASE_DIR / "app" / "subscribers.json"

    return Settings(
        telegram_bot_token=telegram_bot_token,
        openrouter_api_key=openrouter_api_key,
        openrouter_model=openrouter_model,
        digest_hour_utc=digest_hour_utc,
        digest_minute_utc=digest_minute_utc,
        database_path=database_path,
        request_timeout_seconds=request_timeout_seconds,
        rss_feeds=rss_feeds,
    )
