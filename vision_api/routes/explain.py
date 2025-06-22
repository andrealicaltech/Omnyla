"""
Gemini explanation route for medical image analysis
"""

import logging
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional

from ..gemini_client import get_gemini_client

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/explain")
async def explain_image(
    file: UploadFile = File(...),
    query: Optional[str] = Form(None)
):
    """
    Explain medical image findings using Gemini Vision
    
    Args:
        file: Medical image file (DICOM, PNG, JPG)
        query: Optional custom prompt for analysis
        
    Returns:
        JSON response with Gemini explanation
    """
    try:
        logger.info(f"Processing explain request for file: {file.filename}")
        
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Read file content
        file_content = await file.read()
        
        if len(file_content) == 0:
            raise HTTPException(status_code=400, detail="Empty file provided")
        
        # Get Gemini client
        gemini_client = get_gemini_client()
        
        if not gemini_client.initialized:
            raise HTTPException(
                status_code=503, 
                detail="Gemini service unavailable - API key not configured"
            )
        
        # Generate explanation
        result = gemini_client.explain_image(file_content, query)
        
        logger.info(f"Gemini explanation completed for {file.filename} in {result['latency_ms']}ms")
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in explain endpoint: {str(e)}")
        
        # Handle specific Gemini errors
        if "quota exceeded" in str(e).lower() or "429" in str(e):
            raise HTTPException(
                status_code=429,
                detail="Gemini quota exceeded"
            )
        elif "api key" in str(e).lower():
            raise HTTPException(
                status_code=401,
                detail="Invalid API key"
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Explanation failed: {str(e)}"
            ) 