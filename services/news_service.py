from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from typing import Any

import feedparser
import requests


logger = logging.getLogger(__name__)


@dataclass(slots=True)
class NewsItem:
    title: str
    summary: str
    source: str
    published_at: datetime
    url: str


class NewsService:
    def __init__(
        self,
        rss_feeds: list[str],
        max_items: int = 12,
        finnhub_api_key: str | None = None,
        newsapi_api_key: str | None = None,
    ) -> None:
        self.rss_feeds = rss_feeds
        self.max_items = max_items
        self.finnhub_api_key = finnhub_api_key
        self.newsapi_api_key = newsapi_api_key

    def fetch_recent_news(self, hours: int = 24) -> list[NewsItem]:
        start_time = datetime.now(timezone.utc) - timedelta(hours=hours)
        items: list[NewsItem] = []

        items.extend(self._fetch_rss_news(start_time))

        if self.finnhub_api_key:
            items.extend(self._fetch_finnhub_news(start_time))

        if self.newsapi_api_key:
            items.extend(self._fetch_newsapi_news(start_time))

        deduped = self._deduplicate(items)
        filtered = [item for item in deduped if item.published_at >= start_time]
        filtered.sort(key=lambda x: x.published_at, reverse=True)
        return filtered[: self.max_items]

    def _fetch_rss_news(self, start_time: datetime) -> list[NewsItem]:
        items: list[NewsItem] = []
        for feed_url in self.rss_feeds:
            try:
                parsed = feedparser.parse(feed_url)
            except Exception:
                logger.exception("Failed to parse RSS feed: %s", feed_url)
                continue

            feed_source = parsed.feed.get("title", feed_url)
            for entry in parsed.entries:
                published = self._parse_entry_datetime(entry)
                if published is None or published < start_time:
                    continue

                items.append(
                    NewsItem(
                        title=entry.get("title", "Без заголовка"),
                        summary=entry.get("summary", ""),
                        source=feed_source,
                        published_at=published,
                        url=entry.get("link", ""),
                    )
                )

        return items

    def _fetch_finnhub_news(self, start_time: datetime) -> list[NewsItem]:
        now = datetime.now(timezone.utc)
        from_date = start_time.date().isoformat()
        to_date = now.date().isoformat()
        url = "https://finnhub.io/api/v1/news"
        params = {
            "category": "general",
            "from": from_date,
            "to": to_date,
            "token": self.finnhub_api_key,
        }
        items: list[NewsItem] = []

        try:
            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            data = response.json()
        except requests.RequestException:
            logger.exception("Failed to fetch Finnhub news")
            return items

        for row in data:
            dt = datetime.fromtimestamp(row.get("datetime", 0), tz=timezone.utc)
            if dt < start_time:
                continue
            items.append(
                NewsItem(
                    title=row.get("headline", "Без заголовка"),
                    summary=row.get("summary", ""),
                    source="Finnhub",
                    published_at=dt,
                    url=row.get("url", ""),
                )
            )
        return items

    def _fetch_newsapi_news(self, start_time: datetime) -> list[NewsItem]:
        url = "https://newsapi.org/v2/everything"
        params = {
            "q": "(markets OR stocks OR oil OR gas OR inflation OR bonds)",
            "language": "en",
            "sortBy": "publishedAt",
            "from": start_time.isoformat(),
            "apiKey": self.newsapi_api_key,
            "pageSize": 50,
        }
        items: list[NewsItem] = []
        try:
            response = requests.get(url, params=params, timeout=20)
            response.raise_for_status()
            payload = response.json()
        except requests.RequestException:
            logger.exception("Failed to fetch NewsAPI data")
            return items

        for article in payload.get("articles", []):
            raw_dt = article.get("publishedAt")
            if not raw_dt:
                continue
            try:
                dt = datetime.fromisoformat(raw_dt.replace("Z", "+00:00"))
            except ValueError:
                continue
            if dt < start_time:
                continue
            items.append(
                NewsItem(
                    title=article.get("title", "Без заголовка"),
                    summary=article.get("description", ""),
                    source=(article.get("source") or {}).get("name", "NewsAPI"),
                    published_at=dt,
                    url=article.get("url", ""),
                )
            )
        return items

    @staticmethod
    def _parse_entry_datetime(entry: dict[str, Any]) -> datetime | None:
        if "published_parsed" in entry and entry.published_parsed:
            return datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)

        raw = entry.get("published") or entry.get("updated")
        if not raw:
            return None

        try:
            dt = parsedate_to_datetime(raw)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc)
        except (TypeError, ValueError):
            return None

    @staticmethod
    def _deduplicate(items: list[NewsItem]) -> list[NewsItem]:
        seen: set[tuple[str, str]] = set()
        result: list[NewsItem] = []
        for item in items:
            key = (item.title.strip().lower(), item.url.strip().lower())
            if key in seen:
                continue
            seen.add(key)
            result.append(item)
        return result
