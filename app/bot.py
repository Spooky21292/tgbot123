from __future__ import annotations

import logging

from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

from app.services.analysis_service import AnalysisService
from app.services.storage_service import StorageService

logger = logging.getLogger(__name__)


class FinanceDigestBot:
    def __init__(
        self,
        application: Application,
        storage_service: StorageService,
        analysis_service: AnalysisService,
    ) -> None:
        self.application = application
        self.storage_service = storage_service
        self.analysis_service = analysis_service

    async def cmd_start(self, update: Update, _context: ContextTypes.DEFAULT_TYPE) -> None:
        try:
            if update.effective_chat:
                self.storage_service.add_subscriber(update.effective_chat.id)
                if update.message:
                    await update.message.reply_text(
                        "✅ Вы подписаны на ежедневную финансовую сводку."
                    )
        except Exception as exc:
            logger.exception("/start failed: %s", exc)
            if update.message:
                await update.message.reply_text("Ошибка подписки. Попробуйте позже.")

    async def cmd_stop(self, update: Update, _context: ContextTypes.DEFAULT_TYPE) -> None:
        try:
            if update.effective_chat:
                self.storage_service.remove_subscriber(update.effective_chat.id)
                if update.message:
                    await update.message.reply_text("🛑 Вы отписаны от сводки.")
        except Exception as exc:
            logger.exception("/stop failed: %s", exc)
            if update.message:
                await update.message.reply_text("Ошибка отписки. Попробуйте позже.")

    async def cmd_status(self, update: Update, _context: ContextTypes.DEFAULT_TYPE) -> None:
        try:
            count = len(self.storage_service.list_subscribers())
            if update.message:
                await update.message.reply_text(f"✅ Бот работает. Подписчиков: {count}")
        except Exception as exc:
            logger.exception("/status failed: %s", exc)
            if update.message:
                await update.message.reply_text("Ошибка получения статуса.")

    async def cmd_digest(self, update: Update, _context: ContextTypes.DEFAULT_TYPE) -> None:
        await self._send_digest_to_chat(update.effective_chat.id if update.effective_chat else 0)

    async def send_digest_to_subscribers(self) -> None:
        for chat_id in self.storage_service.list_subscribers():
            await self._send_digest_to_chat(chat_id)

    async def _send_digest_to_chat(self, chat_id: int) -> None:
        if chat_id == 0:
            return
        try:
            digest = self.analysis_service.build_digest()
            await self.application.bot.send_message(chat_id=chat_id, text=digest)
        except Exception as exc:
            logger.exception("Sending digest failed for chat_id=%s: %s", chat_id, exc)
            try:
                await self.application.bot.send_message(
                    chat_id=chat_id,
                    text=(
                        "⚠️ Не удалось сформировать полную сводку. "
                        "Попробуйте еще раз позже.\n"
                        "⚠️ Это не инвестиционная рекомендация"
                    ),
                )
            except Exception:
                logger.exception("Even fallback message failed for chat_id=%s", chat_id)

    def attach_handlers(self) -> None:
        self.application.add_handler(CommandHandler("start", self.cmd_start))
        self.application.add_handler(CommandHandler("stop", self.cmd_stop))
        self.application.add_handler(CommandHandler("digest", self.cmd_digest))
        self.application.add_handler(CommandHandler("status", self.cmd_status))


if __name__ == "__main__":
    import asyncio
    import sys
    from pathlib import Path

    project_root = Path(__file__).resolve().parent.parent
    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))

    from app.main import run

    asyncio.run(run())
