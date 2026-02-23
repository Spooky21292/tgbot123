from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    ReplyKeyboardMarkup,
    WebAppInfo,
)
from aiogram.utils.keyboard import InlineKeyboardBuilder


def main_keyboard(web_app_url: str | None = None) -> ReplyKeyboardMarkup:
    keyboard = [
        [KeyboardButton(text="➕ Добавить")],
        [KeyboardButton(text="📅 Сегодня"), KeyboardButton(text="📋 Список")],
        [KeyboardButton(text="✅ Завершённые")],
    ]

    if web_app_url:
        keyboard.append([KeyboardButton(text="🌐 Mini App", web_app=WebAppInfo(url=web_app_url))])

    return ReplyKeyboardMarkup(keyboard=keyboard, resize_keyboard=True)


def task_actions_keyboard(task_id: int) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(text="✅ Сделано", callback_data=f"done:{task_id}")
    builder.button(text="🗑 Удалить", callback_data=f"delete:{task_id}")
    builder.adjust(2)
    return builder.as_markup()


def mini_app_keyboard(web_app_url: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Открыть Mini App 🚀", web_app=WebAppInfo(url=web_app_url))]
        ]
    )
