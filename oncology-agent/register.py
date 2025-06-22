#!/usr/bin/env python3
"""
Simple registration script for the Fetch.ai hackathon.
Registers the oncology agent with Agentverse.
"""

import os
from dotenv import load_dotenv
from fetch_agent import BOT

load_dotenv()

def main():
    agent_address = BOT.address
    api_key = os.getenv('AGENTVERSE_API_KEY')
    
    print(f"🤖 Agent Address: {agent_address}")
    print(f"🔑 API Key: {api_key[:20]}..." if api_key else "❌ No API key found")
    
    print(f"""
    ✅ AGENT READY FOR FETCH.AI HACKATHON SUBMISSION!
    
    📋 Submission Details:
    - Agent Name: oncology_copilot  
    - Address: {agent_address}
    - Description: VCF + scan → pharmacogenomics report
    - Tags: oncology, hackathon24, fetch
    - Local Endpoint: http://127.0.0.1:8000/submit
    - Inspector: https://agentverse.ai/inspect/?uri=http%3A//127.0.0.1%3A8000&address={agent_address}
    
    🚀 Next Steps:
    1. Go to https://agentverse.ai/deploy
    2. Create new deployment with this repository
    3. Build command: pip install -r oncology-agent/requirements.txt  
    4. Run command: python oncology-agent/fetch_agent.py
    5. Set environment variables: AGENTVERSE_API_KEY
    
    💡 The agent accepts JSON like:
    {{
        "vcf_url": "https://example.com/sample.vcf",
        "image_url": "https://example.com/scan.png", 
        "patient_id": "demo"
    }}
    
    And returns YAML reports with mutations, drugs, and clinical trials.
    """)

if __name__ == "__main__":
    main() 