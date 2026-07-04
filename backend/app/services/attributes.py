# Warmth scale: 1 = light, 2 = medium/neutral, 3 = warm.
CATEGORY_WARMTH: dict[str, int] = {
    "a shirt": 1,
    "a t-shirt": 1,
    "a sweater": 3,
    "jeans": 2,
    "trousers": 2,
    "a skirt": 1,
    "shorts": 1,
    "a dress": 1,
    "a jacket": 3,
    "sports shoes": 2,
    "casual shoes": 2,
}

# Which outfit slot a category fills. Keep in sync with CATEGORY_WARMTH's keys.
CATEGORY_SLOT: dict[str, str] = {
    "a shirt": "top",
    "a t-shirt": "top",
    "a sweater": "top",
    "jeans": "bottom",
    "trousers": "bottom",
    "a skirt": "bottom",
    "shorts": "bottom",
    "a dress": "dress",
    "a jacket": "outerwear",
    "sports shoes": "shoes",
    "casual shoes": "shoes",
}


def get_warmth_level(category: str) -> int:
    return CATEGORY_WARMTH.get(category, 2)


def get_slot(category: str) -> str:
    return CATEGORY_SLOT.get(category, "top")


def warmth_to_season_tags(warmth_level: int) -> list[str]:
    if warmth_level <= 1:
        return ["spring", "summer"]
    if warmth_level >= 3:
        return ["fall", "winter"]
    return ["spring", "summer", "fall", "winter"]
