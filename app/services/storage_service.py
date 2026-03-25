from __future__ import annotations

import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class StorageService:
    def __init__(self, path: Path) -> None:
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if not self.path.exists():
            self.path.write_text("[]", encoding="utf-8")

    def _read(self) -> set[int]:
        try:
            payload = json.loads(self.path.read_text(encoding="utf-8"))
            return {int(chat_id) for chat_id in payload}
        except Exception as exc:
            logger.exception("Failed reading subscribers storage: %s", exc)
            return set()

    def _write(self, chat_ids: set[int]) -> None:
        try:
            ordered = sorted(chat_ids)
            self.path.write_text(
                json.dumps(ordered, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
        except Exception as exc:
            logger.exception("Failed writing subscribers storage: %s", exc)

    def add_subscriber(self, chat_id: int) -> None:
        data = self._read()
        data.add(chat_id)
        self._write(data)

    def remove_subscriber(self, chat_id: int) -> None:
        data = self._read()
        data.discard(chat_id)
        self._write(data)

    def list_subscribers(self) -> list[int]:
        return sorted(self._read())
