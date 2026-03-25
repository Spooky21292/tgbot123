from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass

from services.market_service import MarketSnapshot
from services.news_service import NewsItem


@dataclass(slots=True)
class Idea:
    asset: str
    signal: str
    confidence: str
    reason: str
    watch_next: str


@dataclass(slots=True)
class DigestResult:
    summary_text: str
    ideas: list[Idea]


class AnalysisService:
    def build_digest(self, news: list[NewsItem], market: list[MarketSnapshot]) -> DigestResult:
        market_map = {item.name: item for item in market}
        selected_news = news[:5]
        ideas = self._build_ideas(market_map, news)
        risks = self._build_risks(market_map, news)
        scenarios = self._build_scenarios(market_map)
        sentiment = self._market_sentiment(market)

        news_lines = (
            [
                f"- {item.title} ({item.source})"
                for item in selected_news
            ]
            if selected_news
            else ["- Значимых новостей из источников за 24 часа мало; стоит наблюдать за обновлениями в течение дня."]
        )

        message = "\n".join(
            [
                "📊 Финансовая сводка за день",
                "",
                f"Оценка настроения рынка: {sentiment}.",
                "",
                "1. Главные новости:",
                *news_lines,
                "",
                "2. Рынки:",
                f"- Нефть: {self._format_asset(market_map.get('Нефть Brent'))}",
                f"- Газ: {self._format_asset(market_map.get('Газ (NatGas)'))}",
                f"- Доллар: {self._format_asset(market_map.get('Индекс доллара (DXY)'))}",
                f"- Золото: {self._format_asset(market_map.get('Золото'))}",
                "- Индексы: "
                + "; ".join(
                    [
                        f"S&P500 {self._short_asset(market_map.get('S&P 500'))}",
                        f"NASDAQ100 {self._short_asset(market_map.get('NASDAQ 100'))}",
                        f"Dow {self._short_asset(market_map.get('Dow Jones'))}",
                    ]
                ),
                f"- Облигации / доходности: {self._format_asset(market_map.get('US 10Y Yield'))}",
                "",
                "3. Идеи для наблюдения:",
                *[self._format_idea_bullet(idea) for idea in ideas],
                "",
                "4. Риски:",
                *[f"- {risk}" for risk in risks],
                "",
                "5. Возможные сценарии:",
                *[f"- {scenario}" for scenario in scenarios],
                "",
                "⚠️ Это аналитическая сводка и не является индивидуальной инвестиционной рекомендацией.",
            ]
        )
        return DigestResult(summary_text=message, ideas=ideas)

    def format_ideas_message(self, ideas: list[Idea]) -> str:
        if not ideas:
            return "Пока нет выраженных идей дня. Стоит наблюдать за динамикой нефти, индексов и доходностей."

        lines = ["💡 Идеи для наблюдения:", ""]
        for idea in ideas:
            lines.extend(
                [
                    f"Актив: {idea.asset}",
                    f"Сигнал: {idea.signal}",
                    f"Уверенность: {idea.confidence}",
                    f"Причина: {idea.reason}",
                    f"Что отслеживать: {idea.watch_next}",
                    "",
                ]
            )
        lines.append("⚠️ Идеи носят аналитический характер и не являются инвестиционной рекомендацией.")
        return "\n".join(lines)

    def _build_ideas(self, market: dict[str, MarketSnapshot], news: list[NewsItem]) -> list[Idea]:
        ideas: list[Idea] = []

        oil = market.get("Нефть Brent")
        if oil and oil.change_pct is not None:
            if oil.change_pct > 1:
                ideas.append(
                    Idea(
                        asset="Нефтяной сектор",
                        signal="умеренно позитивный",
                        confidence="средняя",
                        reason="Рост нефти может получить продолжение и поддержать компании сектора, если тенденция сохранится.",
                        watch_next="стоит наблюдать за устойчивостью роста Brent и общим риск-аппетитом.",
                    )
                )
            elif oil.change_pct < -1:
                ideas.append(
                    Idea(
                        asset="Нефтяной сектор",
                        signal="нейтрально-негативный",
                        confidence="средняя",
                        reason="Снижение нефти может оставаться фактором давления на сектор в ближайшей сессии.",
                        watch_next="динамику Brent и реакцию отраслевых акций.",
                    )
                )

        usd = market.get("Индекс доллара (DXY)")
        gold = market.get("Золото")
        if usd and gold and usd.change_pct is not None and gold.change_pct is not None:
            if usd.change_pct > 0.3 and gold.change_pct < 0:
                ideas.append(
                    Idea(
                        asset="Золото",
                        signal="нейтральный",
                        confidence="низкая",
                        reason="Укрепление доллара часто сдерживает золото, поэтому актив может оставаться под давлением.",
                        watch_next="индекс доллара и доходности US Treasuries.",
                    )
                )
            elif usd.change_pct < -0.3 and gold.change_pct > 0:
                ideas.append(
                    Idea(
                        asset="Золото",
                        signal="умеренно позитивный",
                        confidence="средняя",
                        reason="Ослабление доллара повышает вероятность сохранения спроса на защитные активы.",
                        watch_next="риторику ФРС и темп движения доходностей.",
                    )
                )

        idx = [market.get("S&P 500"), market.get("NASDAQ 100"), market.get("Dow Jones")]
        valid_changes = [item.change_pct for item in idx if item and item.change_pct is not None]
        if valid_changes:
            avg_change = sum(valid_changes) / len(valid_changes)
            if avg_change > 0.7:
                ideas.append(
                    Idea(
                        asset="Крупная американская технологическая группа",
                        signal="позитивный",
                        confidence="средняя",
                        reason="Индексы растут синхронно, и есть вероятность сохранения инерции при нейтральном новостном фоне.",
                        watch_next="отчеты мегакэпов и доходности 10Y.",
                    )
                )
            elif avg_change < -0.7:
                ideas.append(
                    Idea(
                        asset="Акции роста США",
                        signal="негативный",
                        confidence="средняя",
                        reason="Широкое снижение индексов может указывать на осторожный режим рынка.",
                        watch_next="волатильность и реакцию на макростатистику.",
                    )
                )

        mentions = self._keyword_mentions(news)
        if mentions["gas"] > 1:
            ideas.append(
                Idea(
                    asset="Газовые истории",
                    signal="нейтральный",
                    confidence="низкая",
                    reason="В новостном фоне заметны упоминания газа, что делает сектор интересным для наблюдения.",
                    watch_next="изменение цен на газ и экспортные новости.",
                )
            )

        while len(ideas) < 3:
            ideas.append(
                Idea(
                    asset="Широкий рынок",
                    signal="нейтральный",
                    confidence="низкая",
                    reason="Смешанная динамика не дает категоричных выводов, поэтому уместен сценарный подход.",
                    watch_next="макроэкономические релизы и поток корпоративных новостей.",
                )
            )

        return ideas[:5]

    @staticmethod
    def _build_risks(market: dict[str, MarketSnapshot], news: list[NewsItem]) -> list[str]:
        risks = [
            "Волатильность сырьевых рынков может быстро изменить текущие сигналы по акциям и валютам.",
            "Изменение ожиданий по ставкам ФРС может усилить колебания индексов и доходностей.",
        ]
        us10y = market.get("US 10Y Yield")
        if us10y and us10y.change_pct is not None and us10y.change_pct > 1.5:
            risks.append("Ускорение роста доходности 10Y может усиливать давление на акции роста.")
        else:
            risks.append("Неожиданные макроданные по инфляции/рынку труда могут резко сменить рыночный настрой.")

        if len(news) < 3:
            risks.append("Низкая насыщенность новостей повышает вероятность резких движений на единичных заголовках.")

        return risks[:5]

    @staticmethod
    def _build_scenarios(market: dict[str, MarketSnapshot]) -> list[str]:
        oil = market.get("Нефть Brent")
        idx = market.get("S&P 500")
        yld = market.get("US 10Y Yield")

        scenarios = [
            "Базовый: рынок может двигаться в широком диапазоне до выхода новых макроданных.",
            "Умеренно позитивный: если тенденция роста индексов и стабилизации доходностей сохранится, риск-аппетит может усилиться.",
            "Осторожный: при усилении доллара и росте доходностей защитные активы могут выглядеть устойчивее.",
        ]

        if oil and oil.change_pct is not None and oil.change_pct > 1:
            scenarios[1] = (
                "Умеренно позитивный: если рост нефти и индексов сохранится, циклические сектора могут получить поддержку."
            )

        if idx and idx.change_pct is not None and yld and yld.change_pct is not None:
            if idx.change_pct < 0 and yld.change_pct > 1:
                scenarios[2] = (
                    "Осторожный: при одновременном снижении индексов и росте доходностей акции роста могут оставаться под давлением."
                )

        return scenarios

    @staticmethod
    def _keyword_mentions(news: list[NewsItem]) -> dict[str, int]:
        words = defaultdict(int)
        for item in news:
            txt = f"{item.title} {item.summary}".lower()
            for k, aliases in {
                "gas": ["gas", "lng", "газ"],
                "oil": ["oil", "brent", "нефт"],
                "bonds": ["yield", "treasury", "облигац", "доходност"],
            }.items():
                if any(alias in txt for alias in aliases):
                    words[k] += 1
        return words

    @staticmethod
    def _market_sentiment(market: list[MarketSnapshot]) -> str:
        changes = [m.change_pct for m in market if m.change_pct is not None]
        if not changes:
            return "нейтральное, данных пока недостаточно"

        avg = sum(changes) / len(changes)
        if avg > 0.4:
            return "умеренно позитивное"
        if avg < -0.4:
            return "умеренно осторожное"
        return "смешанное"

    @staticmethod
    def _format_asset(item: MarketSnapshot | None) -> str:
        if item is None or item.price is None or item.change_pct is None:
            return "данные временно недоступны"
        return f"{item.price:.2f} ({item.change_pct:+.2f}% за день)"

    @staticmethod
    def _short_asset(item: MarketSnapshot | None) -> str:
        if item is None or item.change_pct is None:
            return "н/д"
        return f"{item.change_pct:+.2f}%"

    @staticmethod
    def _format_idea_bullet(idea: Idea) -> str:
        return (
            f"- {idea.asset}: {idea.signal}, уверенность {idea.confidence}. "
            f"{idea.reason} Стоит наблюдать: {idea.watch_next}"
        )
