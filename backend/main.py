# backend/main.py
import joblib # to load ml model
from fastapi import FastAPI
from pydantic import BaseModel # for models with nested data structures. To define multiple fields, each with their own types and validations.
from typing import List # for many values like vectors
from fastapi.middleware.cors import CORSMiddleware # Cross-Origin-Resource-Sharing. bridge between OS/database and app

model = joblib.load("rf_model.pkl") # or using svc_model.pkl with 3 features

# define PoseFeatures to be a list of float numbers
class PoseFeatures(BaseModel): # define format of parameters
    features: List[float] # [elbow_angle, shoulder_abd_angle, angle_to_plane, z_diff_elbow, z_diff_wrist]

app = FastAPI()

app.add_middleware(
    CORSMiddleware, # decide which frontend can get resource from my backend API
    allow_origins=["https://funmotion.vercel.app/"],
    allow_credentials=True, # allow sending cookies or HTTP requests
    allow_methods=["*"], # allow all HTTP methods
    allow_headers=["*"], # HTTP POST request sent to backend from frontend
)

@app.post("/predict") # HTTP POST requests to API
def predict_pose(data: PoseFeatures): # turn JSON data from frontend to PoseFeatures' object
    X = [data.features]
    pred = model.predict(X) # predict(x) will return a list like [1] or [0]
    return {"correctness": bool(pred[0])} # return True/False
