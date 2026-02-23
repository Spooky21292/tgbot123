import os
from dataclasses import dataclass

from dotenv import load_dotenv


load_dotenv()


@dataclass(slots=True)
class Config:
    token: str
    timezone: str = "Europe/Stockholm"
    db_path: str = "studyping.db"
    daily_reminder_hour: int = 9
    admin_id: int = 6109616823
    web_app_url: str = ""



def get_config() -> Config:
    token = os.getenv("BOT_TOKEN", "").strip()
    timezone = os.getenv("TIMEZONE", "Europe/Stockholm").strip() or "Europe/Stockholm"
    db_path = os.getenv("DB_PATH", "studyping.db").strip() or "studyping.db"
    daily_reminder_hour = int(os.getenv("DAILY_REMINDER_HOUR", "9").strip() or "9")
    admin_id = int(os.getenv("ADMIN_ID", "6109616823").strip() or "6109616823")
    web_app_url = os.getenv("WEB_APP_URL", "").strip()

    if not token:
        raise ValueError("BOT_TOKEN не найден. Добавь его в .env или переменные окружения.")

    return Config(
        token=token,
        timezone=timezone,
        db_path=db_path,
        daily_reminder_hour=max(0, min(23, daily_reminder_hour)),
        admin_id=admin_id,
        web_app_url=web_app_url,
    )
