"""
BiomedCLIP inference engine with DICOM/PNG preprocessing
"""

import io
import logging
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
import pydicom
from typing import Tuple, Dict, Any, List
import base64

from .loader import get_model, get_medical_conditions

logger = logging.getLogger(__name__)

class ImagePreprocessor:
    """Handle DICOM and standard image preprocessing"""
    
    @staticmethod
    def dicom_to_pil(dicom_bytes: bytes) -> Image.Image:
        """
        Convert DICOM bytes to PIL Image
        
        Args:
            dicom_bytes: Raw DICOM file bytes
            
        Returns:
            PIL Image in RGB format
        """
        try:
            # Parse DICOM
            dicom_data = pydicom.dcmread(io.BytesIO(dicom_bytes))
            
            # Get pixel array
            pixel_array = dicom_data.pixel_array
            
            # Handle different bit depths and photometric interpretations
            if hasattr(dicom_data, 'PhotometricInterpretation'):
                if dicom_data.PhotometricInterpretation == 'MONOCHROME1':
                    # Invert for MONOCHROME1
                    pixel_array = np.max(pixel_array) - pixel_array
            
            # Normalize to 0-255 range
            if pixel_array.dtype != np.uint8:
                pixel_array = pixel_array.astype(np.float64)
                pixel_array = (pixel_array - pixel_array.min()) / (pixel_array.max() - pixel_array.min())
                pixel_array = (pixel_array * 255).astype(np.uint8)
            
            # Convert to PIL Image
            if len(pixel_array.shape) == 2:
                # Grayscale - convert to RGB
                image = Image.fromarray(pixel_array, mode='L').convert('RGB')
            else:
                # Already RGB/color
                image = Image.fromarray(pixel_array)
            
            logger.info(f"DICOM converted to PIL Image: {image.size}")
            return image
            
        except Exception as e:
            logger.error(f"Failed to convert DICOM to PIL: {str(e)}")
            raise ValueError(f"Invalid DICOM file: {str(e)}")
    
    @staticmethod
    def bytes_to_pil(image_bytes: bytes, filename: str) -> Image.Image:
        """
        Convert image bytes to PIL Image
        
        Args:
            image_bytes: Raw image file bytes
            filename: Original filename for format detection
            
        Returns:
            PIL Image in RGB format
        """
        try:
            # Check if it's a DICOM file
            if filename.lower().endswith('.dcm'):
                return ImagePreprocessor.dicom_to_pil(image_bytes)
            
            # Handle standard image formats
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            logger.info(f"Image loaded: {image.size}, mode: {image.mode}")
            return image
            
        except Exception as e:
            logger.error(f"Failed to load image: {str(e)}")
            raise ValueError(f"Invalid image file: {str(e)}")

class BiomedCLIPInference:
    """BiomedCLIP inference engine"""
    
    def __init__(self):
        self.model = None
        self.preprocess = None
        self.tokenizer = None
        self.medical_conditions = get_medical_conditions()
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
    def _ensure_model_loaded(self):
        """Ensure model is loaded"""
        if self.model is None:
            logger.info("Loading BiomedCLIP model for inference")
            self.model, self.preprocess, self.tokenizer = get_model()
    
    def classify_image(self, image_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Classify medical image using BiomedCLIP
        
        Args:
            image_bytes: Raw image file bytes
            filename: Original filename
            
        Returns:
            Dictionary with label and confidence
        """
        try:
            self._ensure_model_loaded()
            
            # Preprocess image
            image = ImagePreprocessor.bytes_to_pil(image_bytes, filename)
            image_tensor = self.preprocess(image).unsqueeze(0).to(self.device)
            
            # Tokenize medical condition texts
            text_tokens = self.tokenizer(self.medical_conditions).to(self.device)
            
            # Run inference
            with torch.no_grad():
                # Get image and text features
                image_features = self.model.encode_image(image_tensor)
                text_features = self.model.encode_text(text_tokens)
                
                # Normalize features
                image_features = F.normalize(image_features, dim=-1)
                text_features = F.normalize(text_features, dim=-1)
                
                # Calculate similarities
                similarities = (image_features @ text_features.T).squeeze(0)
                
                # Get probabilities
                probabilities = F.softmax(similarities * 100, dim=0)  # Scale for better softmax
                
                # Get top prediction
                top_prob, top_idx = torch.max(probabilities, dim=0)
                
                label = self.medical_conditions[top_idx.item()]
                confidence = top_prob.item()
                
                logger.info(f"Classification result: {label} (confidence: {confidence:.3f})")
                
                return {
                    "label": label,
                    "confidence": round(confidence, 3)
                }
                
        except Exception as e:
            logger.error(f"Classification failed: {str(e)}")
            raise RuntimeError(f"Classification failed: {str(e)}")
    
    def classify_with_top_k(self, image_bytes: bytes, filename: str, k: int = 5) -> Dict[str, Any]:
        """
        Classify medical image and return top-k predictions
        
        Args:
            image_bytes: Raw image file bytes
            filename: Original filename
            k: Number of top predictions to return
            
        Returns:
            Dictionary with top-k predictions
        """
        try:
            self._ensure_model_loaded()
            
            # Preprocess image
            image = ImagePreprocessor.bytes_to_pil(image_bytes, filename)
            image_tensor = self.preprocess(image).unsqueeze(0).to(self.device)
            
            # Tokenize medical condition texts
            text_tokens = self.tokenizer(self.medical_conditions).to(self.device)
            
            # Run inference
            with torch.no_grad():
                # Get image and text features
                image_features = self.model.encode_image(image_tensor)
                text_features = self.model.encode_text(text_tokens)
                
                # Normalize features
                image_features = F.normalize(image_features, dim=-1)
                text_features = F.normalize(text_features, dim=-1)
                
                # Calculate similarities
                similarities = (image_features @ text_features.T).squeeze(0)
                
                # Get probabilities
                probabilities = F.softmax(similarities * 100, dim=0)
                
                # Get top-k predictions
                top_probs, top_indices = torch.topk(probabilities, k)
                
                predictions = []
                for i in range(k):
                    predictions.append({
                        "label": self.medical_conditions[top_indices[i].item()],
                        "confidence": round(top_probs[i].item(), 3)
                    })
                
                logger.info(f"Top-{k} predictions: {predictions[0]['label']} ({predictions[0]['confidence']:.3f})")
                
                return {
                    "predictions": predictions,
                    "top_label": predictions[0]["label"],
                    "top_confidence": predictions[0]["confidence"]
                }
                
        except Exception as e:
            logger.error(f"Classification failed: {str(e)}")
            raise RuntimeError(f"Classification failed: {str(e)}")

# Global inference engine
_inference_engine = BiomedCLIPInference()

def classify(image_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Classify medical image
    
    Args:
        image_bytes: Raw image file bytes
        filename: Original filename
        
    Returns:
        Dictionary with label and confidence
    """
    return _inference_engine.classify_image(image_bytes, filename)

def classify_top_k(image_bytes: bytes, filename: str, k: int = 5) -> Dict[str, Any]:
    """
    Classify medical image with top-k predictions
    
    Args:
        image_bytes: Raw image file bytes
        filename: Original filename
        k: Number of top predictions
        
    Returns:
        Dictionary with top-k predictions
    """
    return _inference_engine.classify_with_top_k(image_bytes, filename, k) 