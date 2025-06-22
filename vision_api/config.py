"""
Configuration settings for Vision API with Gemini integration
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Gemini Configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
GEMINI_MODEL_ID = os.getenv("GEMINI_MODEL_ID", "gemini-1.5-flash")

# API Configuration
API_TIMEOUT = 15  # seconds

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO") 