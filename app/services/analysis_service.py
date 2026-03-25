from __future__ import annotations

from datetime import datetime, timezone

from app.services.ai_service import AIService
from app.services.market_service import MarketService
from app.services.news_service import NewsService


class AnalysisService:
    def __init__(
        self,
        news_service: NewsService,
        market_service: MarketService,
        ai_service: AIService,
    ) -> None:
        self.news_service = news_service
        self.market_service = market_service
        self.ai_service = ai_service

    def build_digest(self) -> str:
        news = self.news_service.fetch_top_news(per_feed=3)
        markets = self.market_service.fetch_snapshot()

        news_block = "\n".join(
            [
                f"- {idx + 1}. {item['title']} ({item['source']}) {item['link']}"
                for idx, item in enumerate(news)
            ]
        )

        market_lines = []
        for name, data in markets.items():
            if "error" in data:
                market_lines.append(f"- {name}: {data['error']}")
            else:
                market_lines.append(
                    f"- {name} ({data['ticker']}): {data['price']} ({data['change_pct']}%)"
                )
        market_block = "\n".join(market_lines)

        now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        prompt = f"""
Сформируй ежедневную финансовую сводку на русском языке.
Дата: {now}

Формат строго такой:
📊 Финансовая сводка

1. Новости
2. Рынки
3. Идеи (НЕ советы!)
4. Риски
5. Сценарии

Исходные новости:
{news_block}

Рынки:
{market_block}

Добавь в конце: ⚠️ Это не инвестиционная рекомендация
""".strip()

        return self.ai_service.generate_text(prompt)
