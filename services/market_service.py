from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Iterable

import yfinance as yf


logger = logging.getLogger(__name__)


@dataclass(slots=True)
class MarketSnapshot:
    name: str
    ticker: str
    price: float | None
    change_pct: float | None


class MarketService:
    WATCHLIST: dict[str, str] = {
        "Нефть Brent": "BZ=F",
        "Газ (NatGas)": "NG=F",
        "Золото": "GC=F",
        "Индекс доллара (DXY)": "DX-Y.NYB",
        "S&P 500": "^GSPC",
        "NASDAQ 100": "^NDX",
        "Dow Jones": "^DJI",
        "US 10Y Yield": "^TNX",
        "EUR/USD": "EURUSD=X",
        "USD/RUB": "USDRUB=X",
        "Газпром": "OGZPY",
        "Лукойл": "LKOH.ME",
        "Сбер": "SBER.ME",
        "Apple": "AAPL",
        "Microsoft": "MSFT",
        "NVIDIA": "NVDA",
        "Exxon Mobil": "XOM",
    }

    def fetch_market_data(self) -> list[MarketSnapshot]:
        return self._fetch_bulk(self.WATCHLIST.items())

    def _fetch_bulk(self, items: Iterable[tuple[str, str]]) -> list[MarketSnapshot]:
        snapshots: list[MarketSnapshot] = []
        for name, ticker in items:
            snapshots.append(self._fetch_single(name, ticker))
        return snapshots

    @staticmethod
    def _fetch_single(name: str, ticker: str) -> MarketSnapshot:
        try:
            hist = yf.Ticker(ticker).history(period="5d", interval="1d", auto_adjust=False)
            if hist.empty:
                return MarketSnapshot(name=name, ticker=ticker, price=None, change_pct=None)

            close = hist["Close"].dropna()
            if close.empty:
                return MarketSnapshot(name=name, ticker=ticker, price=None, change_pct=None)

            latest = float(close.iloc[-1])
            prev = float(close.iloc[-2]) if len(close) > 1 else latest
            change_pct = ((latest - prev) / prev * 100) if prev else 0.0
            return MarketSnapshot(name=name, ticker=ticker, price=latest, change_pct=change_pct)
        except Exception:
            logger.exception("Failed to fetch market data for %s (%s)", name, ticker)
            return MarketSnapshot(name=name, ticker=ticker, price=None, change_pct=None)
