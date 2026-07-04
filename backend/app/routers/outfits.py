from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.database import get_session
from app.deps import get_current_user
from app.models import ClothingItem, Outfit, User
from app.schemas import OutfitSuggestion
from app.services.item_view import clothing_item_to_read
from app.services.outfit_picker import suggest_outfit
from app.services.weather_client import get_current_weather

router = APIRouter(prefix="/outfits", tags=["outfits"])


@router.get("/suggestion", response_model=OutfitSuggestion)
async def get_outfit_suggestion(
    lat: float,
    lon: float,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    weather = await get_current_weather(lat, lon)
    items = session.exec(select(ClothingItem).where(ClothingItem.owner_id == current_user.id)).all()
    pick = suggest_outfit(items, weather)

    log = Outfit(
        owner_id=current_user.id,
        top_id=pick.top.id if pick.top else None,
        bottom_id=pick.bottom.id if pick.bottom else None,
        dress_id=pick.dress.id if pick.dress else None,
        shoes_id=pick.shoes.id if pick.shoes else None,
        outerwear_id=pick.outerwear.id if pick.outerwear else None,
        weather_temp_c=weather.temp_c,
        weather_condition=weather.condition,
    )
    session.add(log)
    session.commit()

    return OutfitSuggestion(
        top=clothing_item_to_read(pick.top) if pick.top else None,
        bottom=clothing_item_to_read(pick.bottom) if pick.bottom else None,
        dress=clothing_item_to_read(pick.dress) if pick.dress else None,
        shoes=clothing_item_to_read(pick.shoes) if pick.shoes else None,
        outerwear=clothing_item_to_read(pick.outerwear) if pick.outerwear else None,
        missing_slots=pick.missing_slots,
        weather=weather,
    )
