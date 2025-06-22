#!/usr/bin/env python3
"""
Simple test for the VCF parser to ensure Anthropic integration works
"""

import os
from dotenv import load_dotenv
from handlers.vcf import parse_vcf

def test_vcf_parser():
    load_dotenv()
    
    print("🧬 Testing VCF Parser with Anthropic API")
    print("="*50)
    
    # Check if API key is loaded
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("❌ ANTHROPIC_API_KEY not found in environment")
        return False
    
    print(f"✅ Anthropic API key loaded: {api_key[:20]}...")
    
    # Test with a sample VCF URL
    test_vcf_url = "https://raw.githubusercontent.com/broadinstitute/gatk/master/src/test/resources/org/broadinstitute/hellbender/tools/walkers/variantutils/SelectVariants/testSelectVariants_VCF.vcf"
    
    print(f"\n📥 Downloading and parsing VCF from: {test_vcf_url}")
    
    try:
        result = parse_vcf(test_vcf_url)
        print("✅ VCF parsing successful!")
        print(f"📊 Result: {result}")
        return True
    except Exception as e:
        print(f"❌ VCF parsing failed: {e}")
        return False

if __name__ == "__main__":
    success = test_vcf_parser()
    if success:
        print("\n🎉 VCF parser test passed! Ready to run full agent.")
    else:
        print("\n💥 VCF parser test failed. Please check your API key and try again.")
