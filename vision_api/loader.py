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

# Medical condition labels for classification organized by specialty and body system
MEDICAL_CONDITIONS = [
    # General Pathology
    "normal tissue",
    "abnormal tissue", 
    "pathology",
    "benign tissue",
    "malignant tissue",
    "inflammatory tissue",
    "necrotic tissue",
    "fibrotic tissue",
    
    # Respiratory System
    "normal lung",
    "pneumonia",
    "lung cancer",
    "pulmonary edema",
    "pneumothorax",
    "pleural effusion",
    "atelectasis",
    "emphysema",
    "pulmonary fibrosis",
    "tuberculosis",
    "asthma",
    "bronchitis",
    
    # Cardiovascular System
    "normal heart",
    "cardiomegaly",
    "myocardial infarction",
    "heart failure",
    "pericardial effusion",
    "aortic aneurysm",
    "coronary artery disease",
    
    # Neurological System
    "normal brain",
    "brain tumor",
    "stroke",
    "hemorrhage",
    "ischemia",
    "multiple sclerosis",
    "alzheimer disease",
    "brain metastases",
    "hydrocephalus",
    
    # Gastrointestinal System
    "normal abdomen",
    "liver cirrhosis",
    "hepatitis",
    "pancreatic cancer",
    "gallstones",
    "bowel obstruction",
    "appendicitis",
    "inflammatory bowel disease",
    
    # Musculoskeletal System
    "normal bone",
    "fracture",
    "arthritis",
    "osteoporosis",
    "bone tumor",
    "joint effusion",
    
    # Oncology
    "cancer",
    "tumor",
    "metastasis",
    "lymphoma",
    "leukemia",
    "sarcoma",
    "carcinoma",
    "adenocarcinoma",
    
    # Infectious Diseases
    "infection",
    "abscess",
    "cellulitis",
    "sepsis",
    
    # General Terms
    "inflammation",
    "edema",
    "mass",
    "nodule",
    "cyst",
    "calcification"
]

# Specialty categories for better organization
MEDICAL_SPECIALTIES = {
    "Radiology": ["normal lung", "pneumonia", "lung cancer", "pneumothorax", "pleural effusion", "cardiomegaly", "brain tumor", "stroke"],
    "Pathology": ["normal tissue", "abnormal tissue", "malignant tissue", "benign tissue", "cancer", "tumor", "carcinoma", "adenocarcinoma"],
    "Cardiology": ["normal heart", "cardiomegaly", "myocardial infarction", "heart failure", "coronary artery disease"],
    "Neurology": ["normal brain", "brain tumor", "stroke", "multiple sclerosis", "alzheimer disease"],
    "Gastroenterology": ["normal abdomen", "liver cirrhosis", "hepatitis", "pancreatic cancer", "bowel obstruction"],
    "Orthopedics": ["normal bone", "fracture", "arthritis", "osteoporosis", "bone tumor"],
    "Oncology": ["cancer", "tumor", "metastasis", "lymphoma", "leukemia", "sarcoma"],
    "Infectious Disease": ["infection", "abscess", "cellulitis", "sepsis", "tuberculosis"]
}

# Image type categories for proper organization
IMAGE_CATEGORIES = {
    "Histology": ["histology", "pathology", "microscopy", "tissue", "biopsy"],
    "Radiology": ["xray", "ct", "mri", "ultrasound", "mammography"],
    "Endoscopy": ["endoscopy", "colonoscopy", "gastroscopy", "bronchoscopy"],
    "Dermatology": ["skin", "dermatology", "lesion", "mole", "rash"],
    "Ophthalmology": ["retina", "fundus", "eye", "optical coherence tomography", "oct"],
    "Cardiology": ["echocardiogram", "ekg", "cardiac", "angiography"],
    "General": ["clinical", "medical", "diagnostic"]
}

def get_medical_conditions():
    """Get list of medical conditions for classification"""
    return MEDICAL_CONDITIONS 