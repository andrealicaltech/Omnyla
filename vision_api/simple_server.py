"""
Simple mock vision API server for testing
"""

import os
import logging
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Mock BiomedCLIP Vision API",
    description="Mock medical image analysis API for testing",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock medical conditions
MOCK_CONDITIONS = [
    "Normal tissue",
    "Inflammatory changes",
    "Benign lesion",
    "Malignant neoplasm",
    "Vascular abnormality",
    "Degenerative changes",
    "Infectious process",
    "Metabolic disorder"
]

@app.get("/")
async def root():
    return {
        "message": "Mock BiomedCLIP Vision API v1.0",
        "status": "active",
        "note": "This is a mock API for testing purposes"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Mock BiomedCLIP Vision API",
        "version": "1.0.0"
    }

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    """
    Mock medical image analysis
    """
    try:
        logger.info(f"Processing file: {file.filename}, size: {file.size} bytes")
        
        # Mock analysis result
        primary_condition = random.choice(MOCK_CONDITIONS)
        confidence = round(random.uniform(0.6, 0.95), 3)
        
        # Generate top predictions
        top_predictions = []
        remaining_conditions = [c for c in MOCK_CONDITIONS if c != primary_condition]
        for i in range(min(4, len(remaining_conditions))):
            condition = remaining_conditions[i]
            conf = round(random.uniform(0.3, confidence - 0.1), 3)
            top_predictions.append({
                "condition": condition,
                "confidence": conf,
                "percentage": f"{int(conf * 100)}%"
            })
        
        result = {
            "success": True,
            "primary_prediction": {
                "condition": primary_condition,
                "confidence": confidence,
                "percentage": f"{int(confidence * 100)}%"
            },
            "top_predictions": top_predictions,
            "specialty_analysis": {
                "Radiology": [[primary_condition, confidence]],
                "Pathology": [[primary_condition, confidence * 0.9]]
            },
            "image_info": {
                "category": "Medical",
                "size": f"{file.size} bytes" if file.size else "Unknown",
                "mode": "RGB"
            },
            "clinical_insights": [
                f"Analysis suggests {primary_condition.lower()} with {int(confidence * 100)}% confidence",
                "Recommend clinical correlation and additional imaging if needed",
                "Consider follow-up based on clinical presentation"
            ],
            "analysis_metadata": {
                "model": "Mock BiomedCLIP",
                "conditions_analyzed": len(MOCK_CONDITIONS),
                "specialties_covered": 2
            },
            "heatmap_available": random.choice([True, False])
        }
        
        logger.info(f"Mock analysis completed for {file.filename}")
        
        return JSONResponse(content={
            "status": "success",
            "filename": file.filename,
            "analysis": result
        })
        
    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        raise HTTPException(status_code=500, detail="Analysis failed - please try again")

@app.post("/predict-with-heatmap")
async def predict_with_heatmap(file: UploadFile = File(...)):
    """
    Mock medical image analysis with heatmap
    """
    # Just call the regular predict for now
    return await predict_image(file)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 