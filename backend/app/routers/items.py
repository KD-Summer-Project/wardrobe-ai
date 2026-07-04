import io
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from PIL import Image
from sqlmodel import Session, select

from app.config import get_settings
from app.database import get_session
from app.deps import get_current_user
from app.models import ClothingItem, User
from app.schemas import ClothingItemRead
from app.services.attributes import get_warmth_level, warmth_to_season_tags
from app.services.classifier import classify_category
from app.services.color import extract_dominant_color
from app.services.item_view import clothing_item_to_read

router = APIRouter(prefix="/items", tags=["items"])
settings = get_settings()


@router.post("", response_model=ClothingItemRead)
async def upload_item(
    file: UploadFile,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image file") from exc

    user_dir = Path(settings.upload_dir) / str(current_user.id)
    user_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}.jpg"
    image.save(user_dir / filename, format="JPEG")

    category, _confidence = classify_category(image)
    color = extract_dominant_color(image)
    warmth_level = get_warmth_level(category)
    season_tags = warmth_to_season_tags(warmth_level)

    item = ClothingItem(
        owner_id=current_user.id,
        category=category,
        color=color,
        warmth_level=warmth_level,
        season_tags=season_tags,
        image_path=f"{current_user.id}/{filename}",
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return clothing_item_to_read(item)


@router.get("", response_model=list[ClothingItemRead])
def list_items(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    items = session.exec(select(ClothingItem).where(ClothingItem.owner_id == current_user.id)).all()
    return [clothing_item_to_read(item) for item in items]


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    item = session.get(ClothingItem, item_id)
    if item is None or item.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    image_file = Path(settings.upload_dir) / item.image_path
    image_file.unlink(missing_ok=True)

    session.delete(item)
    session.commit()
