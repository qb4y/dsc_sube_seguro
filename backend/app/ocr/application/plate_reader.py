import base64
import io
import re
from dataclasses import dataclass, field

from PIL import Image, ImageEnhance, ImageFilter

# Peruvian plates: 3 letters + 3 digits (ABC123) or mixed (A1B234, ABC12D)
# Minimum 6 characters total
_PLATE_RE = re.compile(r"^[A-Z]{1,3}\d{1,4}[A-Z0-9]{1,3}$")

# Multiple PSM modes to handle full car photo vs cropped plate
_TESS_CONFIGS = [
    "--psm 6",   # uniform block of text (full image)
    "--psm 11",  # sparse text — finds text wherever it is
    "--psm 7 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",  # single line
]


@dataclass
class PlateReaderResult:
    candidatas: list[str] = field(default_factory=list)


def _normalize(text: str) -> str:
    return text.upper().replace("-", "").replace(" ", "").strip()


def _is_valid_plate(text: str) -> bool:
    norm = _normalize(text)
    return len(norm) >= 5 and bool(_PLATE_RE.fullmatch(norm))


def extract_plates(raw_texts: list[str]) -> list[str]:
    seen: dict[str, None] = {}
    for text in raw_texts:
        norm = _normalize(text)
        if _is_valid_plate(norm):
            seen[norm] = None
    return list(seen)


def _preprocess(img: Image.Image) -> list[Image.Image]:
    """Return multiple preprocessed variants to maximize OCR accuracy."""
    from PIL import ImageOps
    variants = []

    # Downscale very large phone photos to speed up OCR without losing plate detail
    max_dim = 2000
    if img.width > max_dim or img.height > max_dim:
        img.thumbnail((max_dim, max_dim), Image.LANCZOS)

    # 1. Grayscale + upscale + sharpen
    gray = img.convert("L").resize(
        (img.width * 2, img.height * 2), Image.LANCZOS
    )
    sharp = gray.filter(ImageFilter.SHARPEN).filter(ImageFilter.SHARPEN)
    variants.append(sharp)

    # 2. High contrast
    enhanced = ImageEnhance.Contrast(sharp).enhance(3.0)
    variants.append(enhanced)

    # 3. Inverted (dark plates with light background)
    variants.append(ImageOps.invert(enhanced))

    # 4. Original grayscale (no upscale) for sparse text mode
    variants.append(img.convert("L"))

    return variants


async def read_plate_from_image(image_bytes: bytes) -> PlateReaderResult:
    from app.config import get_settings
    s = get_settings()

    # 1. Gemini (free tier — 1500 req/day)
    if s.gemini_api_key:
        result = await _gemini_ocr(image_bytes, s.gemini_api_key)
        if result.candidatas:
            return result

    # 2. Claude Vision
    if s.anthropic_api_key and s.anthropic_api_key != "your-anthropic-key-here":
        result = await _claude_ocr(image_bytes, s.anthropic_api_key)
        if result.candidatas:
            return result

    # 3. Tesseract fallback
    return _tesseract_ocr(image_bytes)


def _tesseract_ocr(image_bytes: bytes) -> PlateReaderResult:
    try:
        import pytesseract
        if not image_bytes:
            return PlateReaderResult()
        img = Image.open(io.BytesIO(image_bytes))
        candidates: dict[str, None] = {}

        for variant in _preprocess(img):
            for cfg in _TESS_CONFIGS:
                try:
                    raw = pytesseract.image_to_string(variant, config=cfg)
                    for token in raw.upper().split():
                        norm = _normalize(token)
                        if _is_valid_plate(norm):
                            candidates[norm] = None
                except Exception:
                    continue

        return PlateReaderResult(candidatas=list(candidates))
    except Exception:
        return PlateReaderResult()


async def _claude_ocr(image_bytes: bytes, api_key: str) -> PlateReaderResult:
    import anthropic

    _PROMPT = (
        "Eres un sistema de lectura de placas vehiculares peruanas. "
        "Analiza la imagen y extrae ÚNICAMENTE el número de placa del vehículo. "
        "Las placas peruanas tienen formato como ABC-123, A1B-234, ABC-12D. "
        "Responde SOLO con el número de placa sin guiones ni espacios (ej: ABC123). "
        "Si no hay placa visible o no puedes leerla, responde: NONE"
    )
    try:
        client = anthropic.AsyncAnthropic(api_key=api_key)
        b64 = base64.standard_b64encode(image_bytes).decode()
        msg = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=32,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": b64}},
                    {"type": "text", "text": _PROMPT},
                ],
            }],
        )
        raw = msg.content[0].text.strip()
        if raw.upper() == "NONE" or not raw:
            return PlateReaderResult()
        norm = _normalize(raw)
        if _is_valid_plate(norm):
            return PlateReaderResult(candidatas=[norm])
        for token in raw.upper().split():
            t = _normalize(token)
            if _is_valid_plate(t):
                return PlateReaderResult(candidatas=[t])
        return PlateReaderResult()
    except Exception:
        return PlateReaderResult()


_VISION_PROMPT = (
    "Eres un sistema de lectura de placas vehiculares peruanas. "
    "Analiza la imagen y extrae ÚNICAMENTE el número de placa del vehículo. "
    "Las placas peruanas tienen formato como ABC-123, A1B-234, ABC-12D. "
    "Responde SOLO con el número de placa sin guiones ni espacios (ej: ABC123). "
    "Si no hay placa visible o no puedes leerla, responde: NONE"
)


async def _gemini_ocr(image_bytes: bytes, api_key: str) -> PlateReaderResult:
    try:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=api_key)
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                _VISION_PROMPT,
            ],
        )
        raw = response.text.strip()
        if not raw or raw.upper() == "NONE":
            return PlateReaderResult()
        norm = _normalize(raw)
        if _is_valid_plate(norm):
            return PlateReaderResult(candidatas=[norm])
        for token in raw.upper().split():
            t = _normalize(token)
            if _is_valid_plate(t):
                return PlateReaderResult(candidatas=[t])
        return PlateReaderResult()
    except Exception:
        return PlateReaderResult()
