# backend/main.py
import joblib
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

model = joblib.load("rf_model.pkl") # Load pre-trained model

# The frontend will send an array of numerical features for prediction
class PoseFeatures(BaseModel):
    features: List[float] # [elbow_angle, shoulder_abd_angle, angle_to_plane, z_diff_elbow, z_diff_wrist]

app = FastAPI() # Initialize FastAPI app

# Enable CORS so that frontend can access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://funmotion.vercel.app"], # Only allow this domain
    allow_credentials=True,
    allow_methods=["*"], # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"], # Allow all headers
)

# API endpoint for prediction
@app.post("/predict")
def predict_pose(data: PoseFeatures):
    X = [data.features]
    pred = model.predict(X)
    return {"correctness": bool(pred[0])} # Return result as boolean (True = correct pose, False = incorrect)
