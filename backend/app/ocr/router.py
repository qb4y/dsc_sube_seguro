from fastapi import APIRouter, File, UploadFile

from app.ocr.application.plate_reader import read_plate_from_image

router = APIRouter(prefix="/ocr", tags=["ocr"])


@router.post("/placa")
async def ocr_placa(imagen: UploadFile = File(...)):
    content = await imagen.read()
    result = await read_plate_from_image(content)
    return {"candidatas": result.candidatas}
