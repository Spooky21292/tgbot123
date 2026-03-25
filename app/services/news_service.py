from __future__ import annotations

import logging
from datetime import datetime, timezone

import feedparser

logger = logging.getLogger(__name__)


class NewsService:
    def __init__(self, feeds: list[str]) -> None:
        self.feeds = feeds

    def fetch_top_news(self, per_feed: int = 3) -> list[dict[str, str]]:
        items: list[dict[str, str]] = []
        for url in self.feeds:
            try:
                parsed = feedparser.parse(url)
                for entry in parsed.entries[:per_feed]:
                    title = getattr(entry, "title", "Без названия")
                    link = getattr(entry, "link", "")
                    published = getattr(entry, "published", "")
                    items.append(
                        {
                            "title": title,
                            "link": link,
                            "published": published,
                            "source": parsed.feed.get("title", url),
                        }
                    )
            except Exception as exc:
                logger.exception("Failed to parse feed %s: %s", url, exc)
        if not items:
            items.append(
                {
                    "title": "Не удалось загрузить новости из RSS",
                    "link": "",
                    "published": datetime.now(timezone.utc).isoformat(),
                    "source": "fallback",
                }
            )
        return items
