from __future__ import annotations

import logging
from datetime import datetime, time, timedelta

from aiogram import Bot, Dispatcher, F
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.exceptions import TelegramBadRequest
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import CallbackQuery, Message
from zoneinfo import ZoneInfo

from config import get_config
from db import Database, Task
from keyboards import main_keyboard, task_actions_keyboard
from scheduler import setup_scheduler


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


class AddTaskState(StatesGroup):
    waiting_subject = State()
    waiting_text = State()
    waiting_due = State()



def format_due_display(due_at_iso: str, timezone: str) -> str:
    dt = datetime.fromisoformat(due_at_iso).astimezone(ZoneInfo(timezone))
    return dt.strftime("%d.%m %H:%M")


def task_card(task: Task, timezone: str, idx: int | None = None) -> str:
    prefix = f"{idx}. " if idx is not None else ""
    return (
        f"{prefix}📚 <b>{task.subject}</b>\n"
        f"📝 {task.text}\n"
        f"📅 {format_due_display(task.due_at, timezone)}"
    )


def parse_due_input(raw: str, timezone: str) -> datetime | None:
    raw = raw.strip()
    now = datetime.now(ZoneInfo(timezone))

    patterns = [
        ("%d.%m", True),
        ("%d.%m %H:%M", False),
    ]

    for fmt, need_default_time in patterns:
        try:
            parsed = datetime.strptime(raw, fmt)
            parsed = parsed.replace(year=now.year)
            if need_default_time:
                parsed = datetime.combine(parsed.date(), time(hour=18, minute=0))
                parsed = parsed.replace(year=now.year)

            return parsed.replace(tzinfo=ZoneInfo(timezone))
        except ValueError:
            continue
    return None


def get_today_bounds(timezone: str) -> tuple[datetime, datetime]:
    tz = ZoneInfo(timezone)
    now = datetime.now(tz)
    start = datetime.combine(now.date(), time.min, tzinfo=tz)
    end = start + timedelta(days=1)
    return start, end


async def send_welcome(message: Message) -> None:
    text = (
        "Привет! Я StudyPing 📌\n"
        "Помогаю не забывать про домашку и дела.\n\n"
        "Команды:\n"
        "/add — добавить задачу\n"
        "/today — задачи на сегодня\n"
        "/list — все активные задачи\n"
        "/help — помощь"
    )
    await message.answer(text, reply_markup=main_keyboard())


async def send_task_list(message: Message, tasks: list[Task], timezone: str, title: str) -> None:
    if not tasks:
        await message.answer("Пока пусто 🙂")
        return

    await message.answer(title)
    for idx, task in enumerate(tasks, start=1):
        await message.answer(
            task_card(task, timezone, idx=idx),
            reply_markup=task_actions_keyboard(task.id),
        )


def register_handlers(dp: Dispatcher, db: Database, timezone: str) -> None:
    @dp.message(Command("start"))
    async def start_handler(message: Message) -> None:
        await send_welcome(message)

    @dp.message(Command("help"))
    async def help_handler(message: Message) -> None:
        await message.answer(
            "ℹ️ Быстрые команды:\n"
            "/add — добавить задачу\n"
            "/today — показать задачи на сегодня\n"
            "/list — показать все активные задачи"
        )

    @dp.message(Command("add"))
    @dp.message(F.text == "➕ Добавить")
    async def add_handler(message: Message, state: FSMContext) -> None:
        await state.set_state(AddTaskState.waiting_subject)
        await message.answer("📚 Введи предмет:")

    @dp.message(AddTaskState.waiting_subject)
    async def add_subject_handler(message: Message, state: FSMContext) -> None:
        subject = (message.text or "").strip()
        if not subject:
            await message.answer("Предмет не должен быть пустым. Попробуй ещё раз:")
            return

        await state.update_data(subject=subject)
        await state.set_state(AddTaskState.waiting_text)
        await message.answer("📝 Теперь введи описание задачи:")

    @dp.message(AddTaskState.waiting_text)
    async def add_text_handler(message: Message, state: FSMContext) -> None:
        text = (message.text or "").strip()
        if not text:
            await message.answer("Описание не должно быть пустым. Попробуй ещё раз:")
            return

        await state.update_data(text=text)
        await state.set_state(AddTaskState.waiting_due)
        await message.answer(
            "📅 Введи дедлайн:\n"
            "• DD.MM (время будет 18:00)\n"
            "• DD.MM HH:MM"
        )

    @dp.message(AddTaskState.waiting_due)
    async def add_due_handler(message: Message, state: FSMContext) -> None:
        raw_due = (message.text or "").strip()
        due_dt = parse_due_input(raw_due, timezone)
        if due_dt is None:
            await message.answer(
                "❌ Неверный формат даты. Пример:\n"
                "• 25.12\n"
                "• 25.12 14:30\n"
                "Попробуй ещё раз:"
            )
            return

        data = await state.get_data()
        subject = data.get("subject", "")
        text = data.get("text", "")
        user_id = message.from_user.id if message.from_user else 0

        task_id = db.add_task(user_id=user_id, subject=subject, text=text, due_at_iso=due_dt.isoformat())
        task = db.get_task(task_id)
        await state.clear()

        if task is None:
            await message.answer("❌ Ошибка при сохранении задачи. Попробуй снова.")
            return

        await message.answer(
            "✅ Задача добавлена!\n\n" + task_card(task, timezone),
            reply_markup=task_actions_keyboard(task.id),
        )

    @dp.message(Command("today"))
    @dp.message(F.text == "📅 Сегодня")
    async def today_handler(message: Message) -> None:
        user_id = message.from_user.id if message.from_user else 0
        start, end = get_today_bounds(timezone)
        tasks = db.get_today_tasks(user_id, start.isoformat(), end.isoformat())
        await send_task_list(message, tasks, timezone, "📅 Задачи на сегодня:")

    @dp.message(Command("list"))
    @dp.message(F.text == "📋 Список")
    async def list_handler(message: Message) -> None:
        user_id = message.from_user.id if message.from_user else 0
        tasks = db.get_active_tasks(user_id)
        await send_task_list(message, tasks, timezone, "📋 Активные задачи:")

    @dp.callback_query(F.data.startswith("done:"))
    async def done_handler(callback: CallbackQuery) -> None:
        task_id = int(callback.data.split(":", maxsplit=1)[1])
        user_id = callback.from_user.id

        ok = db.mark_done(task_id, user_id)
        if ok:
            await callback.answer("Готово ✅")
            try:
                await callback.message.edit_reply_markup(reply_markup=None)
            except TelegramBadRequest:
                pass
            await callback.message.answer("Отлично, задача отмечена как выполненная 🎉")
        else:
            await callback.answer("Не найдено", show_alert=True)

    @dp.callback_query(F.data.startswith("delete:"))
    async def delete_handler(callback: CallbackQuery) -> None:
        task_id = int(callback.data.split(":", maxsplit=1)[1])
        user_id = callback.from_user.id

        ok = db.delete_task(task_id, user_id)
        if ok:
            await callback.answer("Удалено 🗑")
            try:
                await callback.message.edit_reply_markup(reply_markup=None)
            except TelegramBadRequest:
                pass
            await callback.message.answer("Задача удалена.")
        else:
            await callback.answer("Не найдено", show_alert=True)


async def main() -> None:
    cfg = get_config()

    db = Database(cfg.db_path)
    db.init()

    bot = Bot(token=cfg.token, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    dp = Dispatcher(storage=MemoryStorage())

    register_handlers(dp, db, cfg.timezone)
    scheduler = setup_scheduler(bot, db, cfg.timezone)

    logger.info("StudyPing bot started")
    try:
        await dp.start_polling(bot)
    finally:
        scheduler.shutdown(wait=False)
        await bot.session.close()


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
