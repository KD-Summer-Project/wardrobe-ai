from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=utcnow)


class ClothingItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id", index=True)
    category: str
    color: str
    warmth_level: int
    season_tags: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    image_path: str
    created_at: datetime = Field(default_factory=utcnow)


class Outfit(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="user.id", index=True)
    top_id: Optional[int] = Field(default=None, foreign_key="clothingitem.id")
    bottom_id: Optional[int] = Field(default=None, foreign_key="clothingitem.id")
    dress_id: Optional[int] = Field(default=None, foreign_key="clothingitem.id")
    shoes_id: Optional[int] = Field(default=None, foreign_key="clothingitem.id")
    outerwear_id: Optional[int] = Field(default=None, foreign_key="clothingitem.id")
    weather_temp_c: float
    weather_condition: str
    created_at: datetime = Field(default_factory=utcnow)
    liked: Optional[bool] = None
