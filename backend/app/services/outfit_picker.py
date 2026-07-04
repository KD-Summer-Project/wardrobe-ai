import random
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Optional

from app.models import ClothingItem
from app.schemas import WeatherData
from app.services.attributes import get_slot

NEUTRAL_COLORS = {"black", "white", "gray", "beige", "brown", "navy"}

WET_CONDITIONS = {"rain", "storm", "snow"}

NUM_CANDIDATES = 5


@dataclass
class OutfitPick:
    top: Optional[ClothingItem] = None
    bottom: Optional[ClothingItem] = None
    dress: Optional[ClothingItem] = None
    shoes: Optional[ClothingItem] = None
    outerwear: Optional[ClothingItem] = None
    missing_slots: list[str] = field(default_factory=list)

    def items(self) -> list[ClothingItem]:
        return [i for i in (self.top, self.bottom, self.dress, self.shoes, self.outerwear) if i is not None]


def _group_by_slot(items: list[ClothingItem]) -> dict[str, list[ClothingItem]]:
    by_slot: dict[str, list[ClothingItem]] = defaultdict(list)
    for item in items:
        by_slot[get_slot(item.category)].append(item)
    return by_slot


def _filter_bottoms_for_cold(bottoms: list[ClothingItem]) -> list[ClothingItem]:
    return [b for b in bottoms if b.category != "shorts"]


def _should_include_outerwear(cold: bool, mild: bool, wet: bool) -> bool:
    if cold or wet:
        return True
    if mild:
        return random.random() < 0.5
    return False


def _bottom_weight(item: ClothingItem, very_hot: bool) -> float:
    if very_hot and item.warmth_level == 1:
        return 3.0
    return 1.0


def _color_clash_penalty(items: list[ClothingItem]) -> int:
    non_neutral_colors = {i.color for i in items if i.color not in NEUTRAL_COLORS}
    return max(0, len(non_neutral_colors) - 1)


def _build_candidate(
    branch: str,
    tops: list[ClothingItem],
    bottoms: list[ClothingItem],
    dresses: list[ClothingItem],
    shoes: list[ClothingItem],
    outerwear_pool: list[ClothingItem],
    include_outerwear: bool,
    very_hot: bool,
) -> OutfitPick:
    pick = OutfitPick()

    if branch == "dress":
        pick.dress = random.choice(dresses) if dresses else None
    else:
        pick.top = random.choice(tops) if tops else None
        pick.bottom = random.choices(bottoms, weights=[_bottom_weight(b, very_hot) for b in bottoms], k=1)[0] if bottoms else None

    pick.shoes = random.choice(shoes) if shoes else None
    if include_outerwear and outerwear_pool:
        pick.outerwear = random.choice(outerwear_pool)

    return pick


def suggest_outfit(items: list[ClothingItem], weather: WeatherData) -> OutfitPick:
    by_slot = _group_by_slot(items)
    tops = by_slot.get("top", [])
    bottoms = by_slot.get("bottom", [])
    dresses = by_slot.get("dress", [])
    shoes = by_slot.get("shoes", [])
    outerwear_pool = by_slot.get("outerwear", [])

    cold = weather.temp_c < 10
    mild = 10 <= weather.temp_c < 18
    hot = weather.temp_c >= 18
    very_hot = weather.temp_c >= 24
    wet = weather.condition in WET_CONDITIONS

    if cold:
        bottoms = _filter_bottoms_for_cold(bottoms)

    include_outerwear = False if hot else _should_include_outerwear(cold, mild, wet)

    dress_combo_count = len(dresses)
    separates_combo_count = len(tops) * len(bottoms)

    if dress_combo_count == 0 and separates_combo_count == 0:
        branch = "separates"  # neither is viable; fall through to report missing slots below
    elif dress_combo_count == 0:
        branch = "separates"
    elif separates_combo_count == 0:
        branch = "dress"
    else:
        branch = random.choices(["dress", "separates"], weights=[dress_combo_count, separates_combo_count])[0]

    candidates = [
        _build_candidate(branch, tops, bottoms, dresses, shoes, outerwear_pool, include_outerwear, very_hot)
        for _ in range(NUM_CANDIDATES)
    ]
    best = min(candidates, key=lambda pick: _color_clash_penalty(pick.items()))

    missing_slots = []
    if branch == "dress" and best.dress is None:
        missing_slots.append("dress")
    if branch == "separates":
        if best.top is None:
            missing_slots.append("top")
        if best.bottom is None:
            missing_slots.append("bottom")
    if best.shoes is None:
        missing_slots.append("shoes")
    best.missing_slots = missing_slots

    return best
