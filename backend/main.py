# main.py
import joblib
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

# 載入模型
model = joblib.load("rf_model.pkl")

# 定義輸入格式
class PoseFeatures(BaseModel):
    features: List[float] # [elbow_angle, shoulder_abd_angle, angle_to_plane, z_diff_elbow, z_diff_wrist]

# 建立 FastAPI 實例
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 或指定你的前端網址，如 ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict")
def predict_pose(data: PoseFeatures):
    X = [data.features]  # 轉成 2D 陣列
    pred = model.predict(X)
    return {"correct": bool(pred[0])}
