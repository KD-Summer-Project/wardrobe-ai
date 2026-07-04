from app.models import ClothingItem
from app.schemas import WeatherData
from app.services.outfit_picker import suggest_outfit


def make_item(id, category, color="black", warmth_level=2) -> ClothingItem:
    return ClothingItem(
        id=id,
        owner_id=1,
        category=category,
        color=color,
        warmth_level=warmth_level,
        season_tags=[],
        image_path=f"{id}.jpg",
    )


def full_wardrobe():
    return [
        make_item(1, "a shirt", "white", 1),
        make_item(2, "a sweater", "navy", 3),
        make_item(3, "jeans", "blue", 2),
        make_item(4, "shorts", "beige", 1),
        make_item(5, "a dress", "red", 1),
        make_item(6, "a jacket", "black", 3),
        make_item(7, "casual shoes", "white", 2),
        make_item(8, "sports shoes", "gray", 2),
    ]


def test_cold_and_rainy_requires_outerwear_and_excludes_shorts():
    weather = WeatherData(temp_c=2, feels_like_c=-2, condition="rain", description="rain", humidity=80)
    outfit = suggest_outfit(full_wardrobe(), weather)

    assert outfit.outerwear is not None
    if outfit.bottom is not None:
        assert outfit.bottom.category != "shorts"
    assert outfit.shoes is not None
    assert outfit.missing_slots == []


def test_hot_and_clear_excludes_outerwear():
    weather = WeatherData(temp_c=28, feels_like_c=30, condition="clear", description="clear sky", humidity=40)
    outfit = suggest_outfit(full_wardrobe(), weather)

    assert outfit.outerwear is None
    assert outfit.shoes is not None
    assert outfit.missing_slots == []


def test_sparse_wardrobe_reports_missing_shoes():
    weather = WeatherData(temp_c=20, feels_like_c=20, condition="clear", description="clear sky", humidity=40)
    sparse = [make_item(1, "a shirt"), make_item(2, "jeans")]
    outfit = suggest_outfit(sparse, weather)

    assert outfit.shoes is None
    assert "shoes" in outfit.missing_slots
    assert outfit.top is not None
    assert outfit.bottom is not None


def test_empty_wardrobe_reports_all_missing_slots():
    weather = WeatherData(temp_c=20, feels_like_c=20, condition="clear", description="clear sky", humidity=40)
    outfit = suggest_outfit([], weather)

    assert outfit.top is None
    assert outfit.bottom is None
    assert outfit.shoes is None
    assert "top" in outfit.missing_slots
    assert "bottom" in outfit.missing_slots
    assert "shoes" in outfit.missing_slots


def test_shuffle_can_produce_different_combinations():
    weather = WeatherData(temp_c=20, feels_like_c=20, condition="clear", description="clear sky", humidity=40)
    wardrobe = full_wardrobe()
    results = {tuple(sorted(i.id for i in suggest_outfit(wardrobe, weather).items())) for _ in range(30)}

    assert len(results) > 1
