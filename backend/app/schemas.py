from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    id: int
    email: EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ClothingItemRead(BaseModel):
    id: int
    category: str
    color: str
    warmth_level: int
    season_tags: list[str]
    image_url: str
    created_at: datetime


class WeatherData(BaseModel):
    temp_c: float
    feels_like_c: float
    condition: str
    description: str
    humidity: int
    city_name: str | None = None


class OutfitSuggestion(BaseModel):
    top: ClothingItemRead | None = None
    bottom: ClothingItemRead | None = None
    dress: ClothingItemRead | None = None
    shoes: ClothingItemRead | None = None
    outerwear: ClothingItemRead | None = None
    missing_slots: list[str]
    weather: WeatherData
