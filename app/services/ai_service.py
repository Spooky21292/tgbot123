from __future__ import annotations

import logging
import time

import requests

logger = logging.getLogger(__name__)


class AIService:
    OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

    def __init__(
        self,
        api_key: str,
        model: str = "deepseek/deepseek-chat:free",
        timeout_seconds: int = 30,
    ) -> None:
        self.api_key = api_key
        self.model = model
        self.timeout_seconds = timeout_seconds

    def generate_text(self, prompt: str) -> str:
        fallback = (
            "⚠️ AI-сервис временно недоступен. Ниже базовая версия сводки.\n\n"
            "1) Новости: проверьте Reuters / WSJ / Bloomberg.\n"
            "2) Рынки: следите за волатильностью индексов и сырья.\n"
            "3) Идеи: работайте только по риск-менеджменту.\n"
            "4) Риски: геополитика, инфляция, ставка ФРС.\n"
            "5) Сценарии: базовый / позитивный / стресс.\n\n"
            "⚠️ Это не инвестиционная рекомендация"
        )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://railway.app",
            "X-Title": "finance-digest-bot",
        }
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "Ты финансовый аналитик. Пиши кратко, структурно, нейтрально. "
                        "Не давай инвестиционных рекомендаций."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.3,
        }

        for attempt in range(1, 4):
            try:
                response = requests.post(
                    self.OPENROUTER_URL,
                    headers=headers,
                    json=payload,
                    timeout=self.timeout_seconds,
                )
                response.raise_for_status()
                body = response.json()
                text = body["choices"][0]["message"]["content"].strip()
                if text:
                    return text
            except Exception as exc:
                logger.exception("OpenRouter call failed (attempt %d/3): %s", attempt, exc)
                if attempt < 3:
                    time.sleep(2)

        return fallback
