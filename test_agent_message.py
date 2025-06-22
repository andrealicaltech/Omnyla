#!/usr/bin/env python3
"""
Test script to send a proper Fetch.ai message to the oncology agent
"""
import asyncio
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'oncology-agent'))

from uagents import Agent, Context
from messages import VCFScanRequest, YAMLReply

# Create a test agent to send messages
test_agent = Agent(name="test_sender", seed="test_sender_seed")

# Target agent address (your oncology agent)
ONCOLOGY_AGENT_ADDRESS = "agent1qfmww97nj43pkl3qyvkwxuey752dc6enlm475ylgv399drpj0urjze29u3m"

@test_agent.on_event("startup")
async def send_test_request(ctx: Context):
    print("🧪 Sending test VCF analysis request...")
    
    # Create test request
    request = VCFScanRequest(
        vcf_url="https://raw.githubusercontent.com/genomicsengland/example-files/master/vcf/variant.vcf",
        image_url=None,
        patient_id="HACKATHON_TEST_PATIENT"
    )
    
    print(f"📦 Request: {request}")
    
    # Send to oncology agent
    await ctx.send(ONCOLOGY_AGENT_ADDRESS, request)
    print("✅ Message sent! Check the agent inspector for activity.")

@test_agent.on_message(model=YAMLReply)
async def handle_response(ctx: Context, sender: str, msg: YAMLReply):
    print(f"\n🎉 Received response from {sender}:")
    print(f"📋 YAML Report:")
    print(msg.yaml)
    print("\n✅ Test completed successfully!")

if __name__ == "__main__":
    print("🚀 Starting test agent to send message...")
    test_agent.run() 