import re
from typing import List


def validate_hex_color(color: str) -> bool:
    """Validate 6-character hex color code (e.g., #FFFFFF)."""
    return bool(re.match(r"^#[0-9a-fA-F]{6}$", color))


def sanitize_tags(tags: List[str]) -> List[str]:
    """Sanitize and deduplicate tags, removing spaces and lowercase them."""
    sanitized = []
    for tag in tags:
        clean = tag.strip().lower()
        if clean and clean not in sanitized and " " not in clean:
            sanitized.append(clean)
    return sanitized[:10]
