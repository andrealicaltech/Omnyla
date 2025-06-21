"""
BiomedCLIP model loader with caching
"""

import os
import logging
import torch
import open_clip
from typing import Optional, Tuple
import hashlib

logger = logging.getLogger(__name__)

class BiomedCLIPLoader:
    """Singleton loader for BiomedCLIP model"""
    
    _instance = None
    _model = None
    _preprocess = None
    _tokenizer = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(BiomedCLIPLoader, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        self.model_name = "hf-hub:microsoft/BiomedCLIP-PubMedBERT_256-vit_base_patch16_224"
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.cache_dir = os.path.expanduser("~/.cache/biomedclip")
        os.makedirs(self.cache_dir, exist_ok=True)
        
    def load_model(self) -> Tuple[torch.nn.Module, callable, callable]:
        """
        Load BiomedCLIP model, preprocess function, and tokenizer
        
        Returns:
            Tuple of (model, preprocess_fn, tokenizer)
        """
        if self._model is not None:
            logger.info("Using cached BiomedCLIP model")
            return self._model, self._preprocess, self._tokenizer
            
        try:
            logger.info(f"Loading BiomedCLIP model: {self.model_name}")
            logger.info(f"Device: {self.device}")
            
            # Load the model
            model, preprocess_fn, tokenizer = open_clip.create_model_and_transforms(
                self.model_name,
                cache_dir=self.cache_dir,
                device=self.device
            )
            
            # Set to evaluation mode
            model.eval()
            
            # Cache the loaded components
            self._model = model
            self._preprocess = preprocess_fn
            self._tokenizer = tokenizer
            
            logger.info("BiomedCLIP model loaded successfully")
            return model, preprocess_fn, tokenizer
            
        except Exception as e:
            logger.error(f"Failed to load BiomedCLIP model: {str(e)}")
            raise RuntimeError(f"Model loading failed: {str(e)}")
    
    def get_model_info(self) -> dict:
        """Get information about the loaded model"""
        return {
            "model_name": self.model_name,
            "device": self.device,
            "cache_dir": self.cache_dir,
            "loaded": self._model is not None
        }

# Global loader instance
_loader = BiomedCLIPLoader()

def get_model():
    """Get the BiomedCLIP model components"""
    return _loader.load_model()

def get_model_info():
    """Get model information"""
    return _loader.get_model_info()

# Medical condition labels for classification
MEDICAL_CONDITIONS = [
    "normal chest x-ray",
    "pneumonia",
    "covid-19 pneumonia", 
    "lung cancer",
    "pleural effusion",
    "pneumothorax",
    "atelectasis",
    "cardiomegaly",
    "consolidation",
    "edema",
    "emphysema",
    "fibrosis",
    "hernia",
    "infiltration",
    "mass",
    "nodule",
    "pleural thickening",
    "brain tumor",
    "glioma on brain MRI",
    "meningioma",
    "stroke on brain MRI",
    "normal brain MRI",
    "hemorrhage on brain MRI",
    "ischemic stroke",
    "brain metastases",
    "hydrocephalus",
    "multiple sclerosis lesions",
    "alzheimer disease changes",
    "normal abdominal CT",
    "liver cirrhosis",
    "kidney stones",
    "appendicitis",
    "bowel obstruction",
    "abdominal aortic aneurysm",
    "pancreatic cancer",
    "liver metastases",
    "gallstones",
    "inflammatory bowel disease"
]

def get_medical_conditions():
    """Get list of medical conditions for classification"""
    return MEDICAL_CONDITIONS 