#!/usr/bin/env python3
"""
Test script to send data directly to the Fetch.ai agent
Run this to see messages appearing in the agent inspector
"""
import requests
import json
import time

def test_agent():
    url = "http://127.0.0.1:8000/submit"
    
    test_data = {
        "vcf_url": "https://raw.githubusercontent.com/genomicsengland/example-files/master/vcf/variant.vcf",
        "image_url": None,
        "patient_id": "TEST_PATIENT_123"
    }
    
    print("🧪 Testing Fetch.ai Agent")
    print(f"📡 Sending to: {url}")
    print(f"📦 Payload: {json.dumps(test_data, indent=2)}")
    
    try:
        response = requests.post(url, json=test_data, timeout=30)
        
        print(f"\n📊 Response Status: {response.status_code}")
        print(f"📋 Response Content:")
        print(response.text)
        
        if response.status_code == 200:
            print("\n✅ SUCCESS! Check the agent inspector for messages")
        else:
            print(f"\n❌ ERROR: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"\n🔴 Connection Error: {e}")
        print("Make sure your agent is running with: python fetch_agent.py")

if __name__ == "__main__":
    test_agent() 