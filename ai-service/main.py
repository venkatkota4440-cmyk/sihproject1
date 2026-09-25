from fastapi import FastAPI, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from services.crop_scanner import analyze_crop_image
from services.price_predictor import predict_crop_price

app = FastAPI(
    title="AgriNex AI Service",
    description="Intelligent Crop Disease Diagnosis and APMC Mandi Price Prediction API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class CropAnalysisPayload(BaseModel):
    cropTypeHint: Optional[str] = None
    imageBase64: Optional[str] = None

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "AgriNex AI Microservice",
        "endpoints": ["/api/ai/crop-analysis", "/api/ai/price-prediction"]
    }

@app.post("/api/ai/crop-analysis")
async def crop_analysis(payload: CropAnalysisPayload):
    return analyze_crop_image(crop_hint=payload.cropTypeHint)

@app.post("/api/crop-scan")
async def crop_scan(payload: CropAnalysisPayload):
    return analyze_crop_image(crop_hint=payload.cropTypeHint)

@app.get("/api/ai/price-prediction")
def get_price_prediction(
    cropName: str = Query("Red Onions"),
    district: str = Query("Nashik"),
    horizonDays: int = Query(14)
):
    return predict_crop_price(crop_name=cropName, district=district, horizon_days=horizonDays)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
