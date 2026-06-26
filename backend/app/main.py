from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.conductor.router import router as conductor_router
from app.ocr.router import router as ocr_router
from app.verificacion.router import router as verificacion_router

settings = get_settings()

app = FastAPI(title="SubeSeguro API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(verificacion_router)
app.include_router(conductor_router)
app.include_router(ocr_router)


@app.get("/health")
def health():
    return {"status": "ok"}
