import re
from dataclasses import dataclass, field

_PLATE_RE = re.compile(r"^[A-Z]{1,3}\d{1,4}[A-Z0-9]*$")


@dataclass
class PlateReaderResult:
    candidatas: list[str] = field(default_factory=list)


def _normalize(text: str) -> str:
    return text.upper().replace("-", "").replace(" ", "")


def extract_plates(raw_texts: list[str]) -> list[str]:
    seen: dict[str, None] = {}
    for text in raw_texts:
        norm = _normalize(text)
        if _PLATE_RE.fullmatch(norm):
            seen[norm] = None
    return list(seen)


async def read_plate_from_image(image_bytes: bytes) -> PlateReaderResult:
    try:
        import easyocr
        reader = easyocr.Reader(["es", "en"], gpu=False)
        results = reader.readtext(image_bytes, detail=0)
        return PlateReaderResult(candidatas=extract_plates(results))
    except ImportError:
        return PlateReaderResult()
