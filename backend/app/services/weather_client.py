import time

import httpx

from app.config import get_settings
from app.schemas import WeatherData

settings = get_settings()

_CACHE_TTL_SECONDS = 600
_cache: dict[tuple[float, float], tuple[float, WeatherData]] = {}

# OpenWeatherMap's broad weather groups, normalized to a small set of conditions.
_CONDITION_MAP = {
    "Thunderstorm": "storm",
    "Drizzle": "rain",
    "Rain": "rain",
    "Snow": "snow",
    "Clear": "clear",
    "Clouds": "clouds",
}


class WeatherProviderError(Exception):
    """Raised when the upstream weather provider can't be reached or rejects the request."""


def _cache_key(lat: float, lon: float) -> tuple[float, float]:
    return (round(lat, 2), round(lon, 2))


async def get_current_weather(lat: float, lon: float) -> WeatherData:
    key = _cache_key(lat, lon)
    cached = _cache.get(key)
    if cached and time.monotonic() - cached[0] < _CACHE_TTL_SECONDS:
        return cached[1]

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={
                    "lat": lat,
                    "lon": lon,
                    "appid": settings.openweathermap_api_key,
                    "units": "metric",
                },
            )
            response.raise_for_status()
            payload = response.json()
    except httpx.HTTPStatusError as exc:
        raise WeatherProviderError("Weather provider rejected the request (check API key)") from exc
    except httpx.RequestError as exc:
        raise WeatherProviderError("Could not reach the weather provider") from exc

    main_group = payload["weather"][0]["main"]
    weather = WeatherData(
        temp_c=payload["main"]["temp"],
        feels_like_c=payload["main"]["feels_like"],
        condition=_CONDITION_MAP.get(main_group, "other"),
        description=payload["weather"][0]["description"],
        humidity=payload["main"]["humidity"],
        city_name=payload.get("name"),
    )
    _cache[key] = (time.monotonic(), weather)
    return weather
