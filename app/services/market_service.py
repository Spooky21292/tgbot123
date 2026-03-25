from __future__ import annotations

import logging

import yfinance as yf

logger = logging.getLogger(__name__)


class MarketService:
    TICKERS = {
        "Нефть Brent": "BZ=F",
        "Газ (NatGas)": "NG=F",
        "Золото": "GC=F",
        "Индекс доллара DXY": "DX-Y.NYB",
        "S&P 500": "^GSPC",
        "NASDAQ": "^IXIC",
        "Dow Jones": "^DJI",
        "US 10Y Bond": "^TNX",
        "EUR/USD": "EURUSD=X",
        "USD/RUB": "RUB=X",
        "Apple": "AAPL",
        "Microsoft": "MSFT",
        "NVIDIA": "NVDA",
        "Tesla": "TSLA",
    }

    def fetch_snapshot(self) -> dict[str, dict[str, float | str]]:
        result: dict[str, dict[str, float | str]] = {}
        for name, ticker in self.TICKERS.items():
            try:
                history = yf.Ticker(ticker).history(period="2d", interval="1d")
                if history.empty:
                    result[name] = {"ticker": ticker, "error": "Нет данных"}
                    continue
                latest = float(history["Close"].iloc[-1])
                prev = float(history["Close"].iloc[-2]) if len(history) > 1 else latest
                change_pct = ((latest - prev) / prev * 100) if prev else 0.0
                result[name] = {
                    "ticker": ticker,
                    "price": round(latest, 4),
                    "change_pct": round(change_pct, 3),
                }
            except Exception as exc:
                logger.exception("Failed loading ticker %s: %s", ticker, exc)
                result[name] = {"ticker": ticker, "error": str(exc)}
        return result
