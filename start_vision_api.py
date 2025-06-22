#!/usr/bin/env python3
"""
Simple script to start the vision API server
"""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.getcwd())

# Now import and run the server
from vision_api.server import main

if __name__ == "__main__":
    main() 