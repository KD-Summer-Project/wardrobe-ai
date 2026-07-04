from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.database import create_db_and_tables
from app.routers import auth, items, outfits, weather
from app.services.classifier import warm_up
from app.services.weather_client import WeatherProviderError

settings = get_settings()
Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    warm_up()  # load the CLIP model once, eagerly, instead of on the first upload request
    yield


app = FastAPI(title="Wardrobe AI", lifespan=lifespan)

app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")


@app.exception_handler(WeatherProviderError)
async def weather_provider_error_handler(request: Request, exc: WeatherProviderError):
    return JSONResponse(status_code=status.HTTP_502_BAD_GATEWAY, content={"detail": str(exc)})


app.include_router(auth.router)
app.include_router(items.router)
app.include_router(weather.router)
app.include_router(outfits.router)
