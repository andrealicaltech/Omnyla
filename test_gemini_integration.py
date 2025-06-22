#!/usr/bin/env python3
"""
Test script for Gemini integration with the Vision API
"""

import os
import sys
import requests
import time

def test_gemini_integration():
    """Test the Gemini explain endpoint"""
    
    # Set the API key
    os.environ['GOOGLE_API_KEY'] = 'AIzaSyCdgWCxwRHG-33_eMR9dbTC6ccWcYssJKQ'
    
    print("🧪 Testing Gemini Integration")
    print("-" * 40)
    
    # Check if vision API is running
    api_base = "http://localhost:8000"
    
    try:
        response = requests.get(f"{api_base}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Vision API is running")
        else:
            print("❌ Vision API health check failed")
            return
    except requests.exceptions.RequestException:
        print("❌ Vision API is not running. Please start it first.")
        print("   Run: cd vision_api && python -m uvicorn server:app --port 8000")
        return
    
    # Test with a sample medical image
    sample_images = [
        "public/medical-images/mri 1.png",
        "public/medical-images/histology 1.png",
        "public/placeholder.jpg"
    ]
    
    test_image = None
    for img_path in sample_images:
        if os.path.exists(img_path):
            test_image = img_path
            break
    
    if not test_image:
        print("❌ No test images found. Please add a medical image to test.")
        return
    
    print(f"📁 Using test image: {test_image}")
    
    # Test the explain endpoint
    try:
        with open(test_image, 'rb') as f:
            files = {'file': f}
            data = {'query': 'Describe the key findings in this medical image'}
            
            print("🔄 Sending request to Gemini...")
            start_time = time.time()
            
            response = requests.post(
                f"{api_base}/explain",
                files=files,
                data=data,
                timeout=30
            )
            
            elapsed = time.time() - start_time
            
        if response.status_code == 200:
            result = response.json()
            print("✅ Gemini explanation successful!")
            print(f"⏱️  Response time: {elapsed:.2f}s")
            print(f"🧠 Model: {result.get('source', 'Unknown')}")
            print(f"📝 Explanation:\n{result.get('explanation', 'No explanation')}")
            
        else:
            print(f"❌ Gemini explanation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing Gemini: {str(e)}")

if __name__ == "__main__":
    test_gemini_integration() 