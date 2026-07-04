from fastapi import APIRouter, Depends

from app.deps import get_current_user
from app.models import User
from app.schemas import WeatherData
from app.services.weather_client import get_current_weather

router = APIRouter(prefix="/weather", tags=["weather"])


@router.get("", response_model=WeatherData)
async def read_weather(lat: float, lon: float, current_user: User = Depends(get_current_user)):
    return await get_current_weather(lat, lon)
