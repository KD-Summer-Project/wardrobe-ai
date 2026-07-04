from app.models import ClothingItem
from app.schemas import ClothingItemRead


def clothing_item_to_read(item: ClothingItem) -> ClothingItemRead:
    return ClothingItemRead(
        id=item.id,
        category=item.category,
        color=item.color,
        warmth_level=item.warmth_level,
        season_tags=item.season_tags,
        image_url=f"/uploads/{item.image_path}",
        created_at=item.created_at,
    )
