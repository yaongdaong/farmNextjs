from pydantic import BaseModel, Field
from typing import List, Optional

class CropAnalysisRequest(BaseModel):
    crop_name: str = Field(..., description="작물명 (strawberry, tomato, cucumber 등)")
    area_pyeong: float = Field(..., gt=0, description="재배 면적 (평)")
    region_name: str = Field(..., description="지역명 (예: 부산광역시 강서구)")
    transplant_date: str = Field(..., description="정식일 (YYYY-MM-DD)")

class FertilizerSchedule(BaseModel):
    nitrogen_kg: float
    phosphorus_kg: float
    potassium_kg: float
    organic_kg: float

class CropAnalysisResponse(BaseModel):
    crop_name: str
    predicted_harvest_days: int
    estimated_harvest_date: str
    accumulated_gdd: float
    fertilizer_recommendation: FertilizerSchedule
    warnings: List[str]