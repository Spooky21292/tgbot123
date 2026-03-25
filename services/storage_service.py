from __future__ import annotations

import sqlite3
from contextlib import closing
from dataclasses import dataclass
from pathlib import Path


@dataclass(slots=True)
class Subscriber:
    chat_id: int


class StorageService:
    def __init__(self, db_path: str) -> None:
        self.db_path = Path(db_path)
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path)

    def _init_db(self) -> None:
        with closing(self._connect()) as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS subscribers (
                    chat_id INTEGER PRIMARY KEY,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            conn.commit()

    def subscribe(self, chat_id: int) -> bool:
        with closing(self._connect()) as conn:
            cur = conn.execute(
                "INSERT OR IGNORE INTO subscribers (chat_id) VALUES (?)",
                (chat_id,),
            )
            conn.commit()
            return cur.rowcount > 0

    def unsubscribe(self, chat_id: int) -> bool:
        with closing(self._connect()) as conn:
            cur = conn.execute("DELETE FROM subscribers WHERE chat_id = ?", (chat_id,))
            conn.commit()
            return cur.rowcount > 0

    def list_subscribers(self) -> list[Subscriber]:
        with closing(self._connect()) as conn:
            rows = conn.execute("SELECT chat_id FROM subscribers").fetchall()
        return [Subscriber(chat_id=row[0]) for row in rows]
