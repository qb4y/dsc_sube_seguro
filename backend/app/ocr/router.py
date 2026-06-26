import io

import pytesseract
from fastapi import APIRouter, File, UploadFile
from PIL import Image

from app.ocr.application.plate_reader import read_plate_from_image, _preprocess, _TESS_CONFIGS

router = APIRouter(prefix="/ocr", tags=["ocr"])


@router.post("/placa")
async def ocr_placa(imagen: UploadFile = File(...)):
    content = await imagen.read()
    result = await read_plate_from_image(content)
    return {"candidatas": result.candidatas}


@router.post("/placa/debug")
async def ocr_placa_debug(imagen: UploadFile = File(...)):
    """Returns raw tesseract output per variant — only for debugging."""
    content = await imagen.read()
    img = Image.open(io.BytesIO(content))
    raw_outputs = []
    for i, variant in enumerate(_preprocess(img)):
        for cfg in _TESS_CONFIGS:
            try:
                raw = pytesseract.image_to_string(variant, config=cfg)
                tokens = [t for t in raw.upper().split() if t]
                if tokens:
                    raw_outputs.append({"variant": i, "config": cfg, "tokens": tokens[:20]})
            except Exception as e:
                raw_outputs.append({"variant": i, "config": cfg, "error": str(e)})
    return {"debug": raw_outputs, "image_size": [img.width, img.height]}
