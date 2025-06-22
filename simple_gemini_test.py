#!/usr/bin/env python3
"""
Simple Gemini integration test
"""

import os
import sys

# Add vision_api to path
sys.path.append('vision_api')

def test_gemini_direct():
    """Test Gemini integration directly"""
    
    print("🧪 Direct Gemini Integration Test")
    print("-" * 40)
    
    # Set API key
    os.environ['GOOGLE_API_KEY'] = 'AIzaSyCdgWCxwRHG-33_eMR9dbTC6ccWcYssJKQ'
    
    try:
        # Import and test Gemini client
        from vision_api.gemini_client import get_gemini_client
        
        print("✅ Gemini client imported successfully")
        
        client = get_gemini_client()
        
        if client.initialized:
            print("✅ Gemini client initialized successfully")
            print(f"   Model: {client.model.model_name if hasattr(client.model, 'model_name') else 'gemini-1.5-flash'}")
        else:
            print("❌ Gemini client failed to initialize")
            return
        
        # Test with a simple image (if available)
        test_images = [
            "public/medical-images/mri 1.png",
            "public/medical-images/histology 1.png", 
            "public/placeholder.jpg"
        ]
        
        test_image = None
        for img_path in test_images:
            if os.path.exists(img_path):
                test_image = img_path
                break
        
        if test_image:
            print(f"📁 Found test image: {test_image}")
            
            try:
                with open(test_image, 'rb') as f:
                    image_bytes = f.read()
                
                print("🔄 Testing Gemini explanation...")
                
                result = client.explain_image(
                    image_bytes, 
                    "Briefly describe what you see in this image"
                )
                
                print("✅ Gemini explanation successful!")
                print(f"⏱️  Response time: {result['latency_ms']}ms")
                print(f"🧠 Model: {result['source']}")
                print(f"📝 Explanation:")
                print(f"   {result['explanation']}")
                
            except Exception as e:
                print(f"❌ Gemini explanation failed: {str(e)}")
        else:
            print("⚠️  No test images found - testing API initialization only")
            print("✅ Gemini integration is working (API key validated)")
        
    except ImportError as e:
        print(f"❌ Import error: {str(e)}")
        print("   Make sure you're in the correct directory and dependencies are installed")
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")

if __name__ == "__main__":
    test_gemini_direct() 