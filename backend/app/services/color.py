import numpy as np
from PIL import Image
from sklearn.cluster import KMeans

# Reference RGB values for a small human-readable color palette.
PALETTE = {
    "black": (20, 20, 20),
    "white": (245, 245, 245),
    "gray": (130, 130, 130),
    "beige": (222, 203, 164),
    "brown": (101, 67, 33),
    "red": (200, 30, 30),
    "orange": (235, 130, 40),
    "yellow": (230, 210, 50),
    "green": (50, 140, 70),
    "blue": (40, 90, 200),
    "navy": (20, 30, 80),
    "purple": (120, 60, 160),
    "pink": (235, 150, 190),
}

_BACKGROUND_THRESHOLD = 235  # pixels with all channels above this are treated as background


def _nearest_palette_color(rgb: np.ndarray) -> str:
    best_name, best_distance = "gray", float("inf")
    for name, ref in PALETTE.items():
        distance = float(np.sum((rgb - np.array(ref)) ** 2))
        if distance < best_distance:
            best_name, best_distance = name, distance
    return best_name


def extract_dominant_color(image: Image.Image, k: int = 4) -> str:
    small = image.convert("RGB").resize((100, 100))
    pixels = np.array(small).reshape(-1, 3)

    foreground = pixels[~np.all(pixels > _BACKGROUND_THRESHOLD, axis=1)]
    if len(foreground) < k:
        foreground = pixels

    kmeans = KMeans(n_clusters=k, n_init=4, random_state=0).fit(foreground)
    counts = np.bincount(kmeans.labels_)
    dominant_rgb = kmeans.cluster_centers_[np.argmax(counts)]
    return _nearest_palette_color(dominant_rgb)
