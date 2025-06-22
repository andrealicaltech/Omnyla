"""
Gemini client wrapper for medical image analysis
"""

import logging
import time
import base64
from typing import Optional, Dict, Any
import google.generativeai as genai
from .config import GOOGLE_API_KEY, GEMINI_MODEL_ID, API_TIMEOUT

logger = logging.getLogger(__name__)

class GeminiClient:
    def __init__(self):
        self.model = None
        self.initialized = False
        self._initialize()
    
    def _initialize(self):
        """Initialize the Gemini client"""
        try:
            if not GOOGLE_API_KEY:
                logger.warning("GOOGLE_API_KEY not found in environment variables")
                return
            
            genai.configure(api_key=GOOGLE_API_KEY)
            self.model = genai.GenerativeModel(GEMINI_MODEL_ID)
            self.initialized = True
            logger.info(f"Gemini client initialized with model: {GEMINI_MODEL_ID}")
            
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {str(e)}")
            self.initialized = False
    
    def explain_image(self, image_bytes: bytes, query: Optional[str] = None) -> Dict[str, Any]:
        """
        Explain medical image findings using Gemini Vision
        
        Args:
            image_bytes: Raw image data
            query: Optional custom prompt
            
        Returns:
            Dictionary with explanation, source, and metadata
        """
        if not self.initialized:
            raise Exception("Gemini client not initialized - check API key")
        
        start_time = time.time()
        
        try:
            # Default prompt for medical image analysis
            default_prompt = """
            Act as a radiology resident reviewing this medical image.
            Explain the key findings in plain language for case-discussion notes.
            Focus on:
            1. Primary abnormal findings (if any)
            2. Anatomical structures visible
            3. Clinical significance
            4. Potential differential diagnosis considerations
            
            Use ≤120 words. Be precise and medical in terminology but clear for clinical teams.
            """
            
            prompt = query if query else default_prompt
            
            # Prepare image for Gemini
            import PIL.Image
            import io
            
            image = PIL.Image.open(io.BytesIO(image_bytes))
            
            # Generate explanation with retry logic
            explanation = self._generate_with_retry(prompt, image)
            
            latency_ms = int((time.time() - start_time) * 1000)
            
            return {
                "explanation": explanation,
                "source": GEMINI_MODEL_ID,
                "latency_ms": latency_ms
            }
            
        except Exception as e:
            logger.error(f"Gemini explanation failed: {str(e)}")
            raise Exception(f"Gemini analysis failed: {str(e)}")
    
    def _generate_with_retry(self, prompt: str, image, max_retries: int = 1) -> str:
        """Generate explanation with retry logic for rate limits"""
        
        for attempt in range(max_retries + 1):
            try:
                response = self.model.generate_content(
                    [prompt, image],
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.1
                    )
                )
                
                if response.text:
                    return response.text.strip()
                else:
                    raise Exception("Empty response from Gemini")
                    
            except Exception as e:
                if "503" in str(e) and attempt < max_retries:
                    logger.warning(f"Gemini 503 error, retrying... (attempt {attempt + 1})")
                    time.sleep(1)
                    continue
                else:
                    raise e
        
        raise Exception("Max retries exceeded")

# Singleton instance
_gemini_client = None

def get_gemini_client() -> GeminiClient:
    """Get singleton Gemini client instance"""
    global _gemini_client
    if _gemini_client is None:
        _gemini_client = GeminiClient()
    return _gemini_client 