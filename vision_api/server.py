"""
FastAPI server for BiomedCLIP vision analysis
"""

import os
import logging
from typing import Optional
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from .inference import classify, classify_top_k
from .loader import get_model_info

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="BiomedCLIP Vision API",
    description="Medical image analysis using BiomedCLIP",
    version="0.1.0"
)

# Add CORS middleware for hackathon (allow all origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "BiomedCLIP Vision API is running", "version": "0.1.0"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    model_info = get_model_info()
    return {
        "status": "healthy",
        "service": "vision-api",
        "model": "BiomedCLIP",
        "endpoints": ["/predict", "/predict-with-heatmap"],
        "model_info": model_info
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Analyze medical image and return classification
    
    Args:
        file: Medical image file (.dcm, .png, .jpg)
        
    Returns:
        JSON with label and confidence
    """
    try:
        # Validate file type
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
            
        allowed_extensions = {'.dcm', '.png', '.jpg', '.jpeg'}
        file_ext = os.path.splitext(file.filename.lower())[1]
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Read file content
        file_content = await file.read()
        logger.info(f"Processing file: {file.filename}, size: {len(file_content)} bytes")
        
        # Run BiomedCLIP inference
        result = classify(file_content, file.filename)
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        raise HTTPException(status_code=500, detail="Analysis failed - retry")

@app.post("/predict-with-heatmap")
async def predict_with_heatmap(file: UploadFile = File(...)):
    """
    Analyze medical image and return classification with heatmap
    
    Args:
        file: Medical image file (.dcm, .png, .jpg)
        
    Returns:
        JSON with label, confidence, and heatmap
    """
    try:
        # Validate file type
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
            
        allowed_extensions = {'.dcm', '.png', '.jpg', '.jpeg'}
        file_ext = os.path.splitext(file.filename.lower())[1]
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Read file content
        file_content = await file.read()
        logger.info(f"Processing file with heatmap: {file.filename}, size: {len(file_content)} bytes")
        
        # Run BiomedCLIP inference (heatmap functionality to be implemented)
        result = classify(file_content, file.filename)
        
        # Add placeholder heatmap for now
        result["heatmap"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing file with heatmap: {str(e)}")
        raise HTTPException(status_code=500, detail="Analysis failed - retry")

def main():
    """Run the server"""
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "vision_api.server:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main() 