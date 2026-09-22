# config.py            
# 상수 설정 (CROP_TEMP_MASTER, FERTILIZER_MASTER 등)
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

MODEL_PATH = DATA_DIR / "weather_lstm.pt"
KMA_COORDS_PATH = DATA_DIR / "kma_coords.csv"
WEATHER_HISTORY_PATH = DATA_DIR / "weather_history.csv"

# 작물별 기준온도 및 목표 적산온도(GDD)
CROP_TEMP_MASTER = {
    "strawberry": {"base_temp": 5.0, "target_gdd": 600.0, "optimal_max": 25.0},
    "tomato": {"base_temp": 10.0, "target_gdd": 1100.0, "optimal_max": 30.0},
    "cucumber": {"base_temp": 12.0, "target_gdd": 800.0, "optimal_max": 28.0},
}

# 100평 기준 필요 시비량 (kg)
FERTILIZER_MASTER_100_PYEONG = {
    "strawberry": {"N": 3.5, "P": 2.0, "K": 3.0, "organic": 200.0},
    "tomato": {"N": 5.0, "P": 3.5, "K": 4.5, "organic": 300.0},
    "cucumber": {"N": 4.5, "P": 3.0, "K": 4.0, "organic": 250.0},
}