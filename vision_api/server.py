"""
FastAPI server for BiomedCLIP vision analysis
"""

import os
import logging
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from .inference import classify, classify_with_heatmap

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="BiomedCLIP Vision API",
    description="Enhanced medical image analysis using BiomedCLIP with comprehensive diagnostic insights",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "BiomedCLIP Vision API v2.0",
        "status": "active",
        "features": [
            "Enhanced medical image classification",
            "Multi-specialty analysis",
            "Clinical insights generation",
            "Image categorization",
            "Confidence scoring",
            "DICOM support"
        ]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "BiomedCLIP Vision API",
        "version": "2.0.0"
    }

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    """
    Enhanced medical image analysis with comprehensive insights
    
    Returns:
        - Primary prediction with confidence
        - Top 5 predictions
        - Specialty-based analysis
        - Clinical insights
        - Image categorization
    """
    try:
        logger.info(f"Processing file: {file.filename}, size: {file.size} bytes")
        
        # Read file content
        file_content = await file.read()
        
        # Perform enhanced classification
        result = classify(file_content, file.filename)
        
        logger.info(f"Analysis completed for {file.filename}")
        
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
    Enhanced medical image analysis with attention heatmap
    
    Returns:
        - All standard analysis features
        - Attention heatmap data
        - Region-based analysis
    """
    try:
        logger.info(f"Processing file with heatmap: {file.filename}, size: {file.size} bytes")
        
        # Read file content
        file_content = await file.read()
        
        # Perform enhanced classification with heatmap
        result = classify_with_heatmap(file_content, file.filename)
        
        logger.info(f"Heatmap analysis completed for {file.filename}")
        
        return JSONResponse(content={
            "status": "success",
            "filename": file.filename,
            "analysis": result
        })
        
    except Exception as e:
        logger.error(f"Error processing file with heatmap: {str(e)}")
        raise HTTPException(status_code=500, detail="Analysis failed - please try again")

@app.get("/capabilities")
async def get_capabilities():
    """Get API capabilities and supported features"""
    return {
        "supported_formats": ["PNG", "JPG", "JPEG", "DICOM", "DCM"],
        "image_categories": [
            "Histology", "Radiology", "Endoscopy", 
            "Dermatology", "Ophthalmology", "Cardiology", "General"
        ],
        "medical_specialties": [
            "Radiology", "Pathology", "Cardiology", "Neurology",
            "Gastroenterology", "Orthopedics", "Oncology", "Infectious Disease"
        ],
        "analysis_features": [
            "Primary diagnosis prediction",
            "Multi-specialty analysis", 
            "Clinical insights generation",
            "Confidence scoring",
            "Image categorization",
            "Top-5 predictions",
            "Attention heatmaps"
        ]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 