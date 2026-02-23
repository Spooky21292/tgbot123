from aiogram.types import InlineKeyboardMarkup, KeyboardButton, ReplyKeyboardMarkup, WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder


def main_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="➕ Добавить")],
            [KeyboardButton(text="📅 Сегодня"), KeyboardButton(text="📋 Список")],
            [KeyboardButton(text="✅ Завершённые")],
        ],
        resize_keyboard=True,
    )


def task_actions_keyboard(task_id: int) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(text="✅ Сделано", callback_data=f"done:{task_id}")
    builder.button(text="🗑 Удалить", callback_data=f"delete:{task_id}")
    builder.adjust(2)
    return builder.as_markup()


def mini_app_keyboard(url: str) -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text="🚀 Открыть StudyPing Mini App", web_app=WebAppInfo(url=url))]],
        resize_keyboard=True,
    )
