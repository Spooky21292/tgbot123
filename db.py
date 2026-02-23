from __future__ import annotations

import sqlite3
from dataclasses import dataclass
from datetime import datetime


@dataclass(slots=True)
class Task:
    id: int
    user_id: int
    subject: str
    text: str
    due_at: str
    created_at: str
    is_done: int
    remind_1day_sent: int
    remind_2h_sent: int
    remind_last_daily_sent: str | None = None


class Database:
    def __init__(self, db_path: str) -> None:
        self.db_path = db_path

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def init(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    subject TEXT NOT NULL,
                    text TEXT NOT NULL,
                    due_at TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    is_done INTEGER NOT NULL DEFAULT 0,
                    remind_1day_sent INTEGER NOT NULL DEFAULT 0,
                    remind_2h_sent INTEGER NOT NULL DEFAULT 0,
                    remind_last_daily_sent TEXT
                )
                """
            )
            conn.commit()


            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    user_id INTEGER PRIMARY KEY,
                    username TEXT
                )
                """
            )
            conn.commit()

            columns = [row[1] for row in conn.execute("PRAGMA table_info(tasks)").fetchall()]
            if "remind_last_daily_sent" not in columns:
                conn.execute("ALTER TABLE tasks ADD COLUMN remind_last_daily_sent TEXT")
                conn.commit()


    def upsert_user(self, user_id: int, username: str | None) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO users (user_id, username)
                VALUES (?, ?)
                ON CONFLICT(user_id) DO UPDATE SET username=excluded.username
                """,
                (user_id, username),
            )
            conn.commit()

    def get_all_users(self) -> list[tuple[int, str | None]]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT user_id, username FROM users ORDER BY user_id ASC"
            ).fetchall()
            return [(int(r["user_id"]), r["username"]) for r in rows]

    def add_task(self, user_id: int, subject: str, text: str, due_at_iso: str) -> int:
        created_at = datetime.utcnow().isoformat()
        with self._connect() as conn:
            cur = conn.execute(
                """
                INSERT INTO tasks (user_id, subject, text, due_at, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (user_id, subject, text, due_at_iso, created_at),
            )
            conn.commit()
            return int(cur.lastrowid)

    def get_task(self, task_id: int) -> Task | None:
        with self._connect() as conn:
            row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
            return Task(**dict(row)) if row else None

    def get_today_tasks(self, user_id: int, start_iso: str, end_iso: str) -> list[Task]:
        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT * FROM tasks
                WHERE user_id = ?
                  AND is_done = 0
                  AND due_at >= ?
                  AND due_at < ?
                ORDER BY due_at ASC
                """,
                (user_id, start_iso, end_iso),
            ).fetchall()
            return [Task(**dict(r)) for r in rows]

    def get_active_tasks(self, user_id: int) -> list[Task]:
        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT * FROM tasks
                WHERE user_id = ? AND is_done = 0
                ORDER BY due_at ASC
                """,
                (user_id,),
            ).fetchall()
            return [Task(**dict(r)) for r in rows]


    def get_completed_tasks(self, user_id: int) -> list[Task]:
        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT * FROM tasks
                WHERE user_id = ? AND is_done = 1
                ORDER BY due_at DESC
                """,
                (user_id,),
            ).fetchall()
            return [Task(**dict(r)) for r in rows]

    def mark_done(self, task_id: int, user_id: int) -> bool:
        with self._connect() as conn:
            cur = conn.execute(
                "UPDATE tasks SET is_done = 1 WHERE id = ? AND user_id = ?",
                (task_id, user_id),
            )
            conn.commit()
            return cur.rowcount > 0

    def delete_task(self, task_id: int, user_id: int) -> bool:
        with self._connect() as conn:
            cur = conn.execute(
                "DELETE FROM tasks WHERE id = ? AND user_id = ?",
                (task_id, user_id),
            )
            conn.commit()
            return cur.rowcount > 0

    def get_tasks_for_reminders(self) -> list[Task]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT * FROM tasks WHERE is_done = 0 ORDER BY due_at ASC"
            ).fetchall()
            return [Task(**dict(r)) for r in rows]

    def set_reminder_flags(
        self,
        task_id: int,
        remind_1day_sent: int | None = None,
        remind_2h_sent: int | None = None,
        remind_last_daily_sent: str | None = None,
    ) -> None:
        updates: list[str] = []
        params: list[int] = []

        if remind_1day_sent is not None:
            updates.append("remind_1day_sent = ?")
            params.append(remind_1day_sent)
        if remind_2h_sent is not None:
            updates.append("remind_2h_sent = ?")
            params.append(remind_2h_sent)
        if remind_last_daily_sent is not None:
            updates.append("remind_last_daily_sent = ?")
            params.append(remind_last_daily_sent)
        if not updates:
            return

        params.append(task_id)
        with self._connect() as conn:
            conn.execute(
                f"UPDATE tasks SET {', '.join(updates)} WHERE id = ?",
                params,
            )
            conn.commit()
