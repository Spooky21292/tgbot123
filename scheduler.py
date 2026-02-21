from __future__ import annotations

import logging
from datetime import datetime

from aiogram import Bot
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from zoneinfo import ZoneInfo

from db import Database, Task


logger = logging.getLogger(__name__)


def format_task_for_reminder(task: Task, due_local: datetime) -> str:
    return (
        f"⏰ Напоминание по задаче\n"
        f"📚 Предмет: {task.subject}\n"
        f"📝 Описание: {task.text}\n"
        f"📅 Дедлайн: {due_local.strftime('%d.%m %H:%M')}"
    )


async def check_reminders(bot: Bot, db: Database, timezone: str, daily_reminder_hour: int) -> None:
    tz = ZoneInfo(timezone)
    now = datetime.now(tz)

    for task in db.get_tasks_for_reminders():
        due_local = datetime.fromisoformat(task.due_at).astimezone(tz)
        seconds_left = (due_local - now).total_seconds()

        if seconds_left <= 0:
            continue

        should_send_1day = seconds_left <= 24 * 3600 and task.remind_1day_sent == 0
        should_send_2h = seconds_left <= 2 * 3600 and task.remind_2h_sent == 0
        last_daily_date = task.remind_last_daily_sent or ""
        today_str = now.date().isoformat()
        should_send_daily = (
            now.hour >= daily_reminder_hour
            and last_daily_date != today_str
        )

        try:
            if should_send_1day:
                await bot.send_message(
                    chat_id=task.user_id,
                    text="🔔 До дедлайна меньше 24 часов!\n\n"
                    + format_task_for_reminder(task, due_local),
                )
                db.set_reminder_flags(task.id, remind_1day_sent=1)
                logger.info("Sent 24h reminder for task_id=%s", task.id)

            if should_send_2h:
                await bot.send_message(
                    chat_id=task.user_id,
                    text="🚨 До дедлайна меньше 2 часов!\n\n"
                    + format_task_for_reminder(task, due_local),
                )
                db.set_reminder_flags(task.id, remind_2h_sent=1)
                logger.info("Sent 2h reminder for task_id=%s", task.id)

            if should_send_daily:
                await bot.send_message(
                    chat_id=task.user_id,
                    text="📌 Ежедневное напоминание\n\n"
                    + format_task_for_reminder(task, due_local),
                )
                db.set_reminder_flags(task.id, remind_last_daily_sent=today_str)
                logger.info("Sent daily reminder for task_id=%s", task.id)
        except Exception:
            logger.exception("Failed sending reminder for task_id=%s", task.id)


def setup_scheduler(bot: Bot, db: Database, timezone: str, daily_reminder_hour: int) -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler(timezone=timezone)
    scheduler.add_job(
        check_reminders,
        "interval",
        minutes=2,
        args=[bot, db, timezone, daily_reminder_hour],
    )
    scheduler.start()
    logger.info("Scheduler started")
    return scheduler
