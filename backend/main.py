# backend/main.py
import joblib
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

model = joblib.load("rf_model.pkl")

class PoseFeatures(BaseModel):
    features: List[float] # [elbow_angle, shoulder_abd_angle, angle_to_plane, z_diff_elbow, z_diff_wrist]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://funmotion.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict")
def predict_pose(data: PoseFeatures):
    X = [data.features]
    pred = model.predict(X)
    return {"correctness": bool(pred[0])}
