from functools import lru_cache

import torch
from PIL import Image

CATEGORY_LABELS = [
    "a shirt",
    "a t-shirt",
    "jeans",
    "trousers",
    "a skirt",
    "a dress",
    "a jacket",
    "a sweater",
    "sports shoes",
    "casual shoes",
    "shorts",
]


@lru_cache
def _load_model():
    import open_clip

    model, _preprocess_train, preprocess_val = open_clip.create_model_and_transforms(
        "hf-hub:Marqo/marqo-fashionCLIP"
    )
    tokenizer = open_clip.get_tokenizer("hf-hub:Marqo/marqo-fashionCLIP")
    model.eval()
    text_features = _encode_labels(model, tokenizer)
    return model, preprocess_val, text_features


def _encode_labels(model, tokenizer):
    tokens = tokenizer(CATEGORY_LABELS)
    with torch.no_grad():
        text_features = model.encode_text(tokens)
        text_features /= text_features.norm(dim=-1, keepdim=True)
    return text_features


def warm_up() -> None:
    """Force the CLIP model to load eagerly (call once at app startup)."""
    _load_model()


def classify_category(image: Image.Image) -> tuple[str, float]:
    model, preprocess_val, text_features = _load_model()

    pixel_values = preprocess_val(image).unsqueeze(0)
    with torch.no_grad():
        image_features = model.encode_image(pixel_values)
        image_features /= image_features.norm(dim=-1, keepdim=True)
        similarity = (100.0 * image_features @ text_features.T).softmax(dim=-1)

    top_value, top_index = similarity[0].topk(1)
    label = CATEGORY_LABELS[top_index[0]]
    confidence = top_value[0].item()
    return label, confidence
