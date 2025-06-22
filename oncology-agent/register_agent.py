import os
from uagents import Agent
from agentverse.registration import register_with_agentverse
from dotenv import load_dotenv

load_dotenv()

# This name should be unique for your agent
IDENTITY_NAME = "oncology_copilot_hackathon"

# Get the API key from environment variables
api_key = os.getenv("AGENTVERSE_API_KEY")

if not api_key:
    raise ValueError("AGENTVERSE_API_KEY environment variable not set. Please create a .env file with the key.")

print(f"Registering agent with identity: {IDENTITY_NAME}")

agent = Agent(name=IDENTITY_NAME, seed=f"{IDENTITY_NAME}_seed")

register_with_agentverse(
    identity=agent,
    api_key=api_key,
    description="AI co-pilot for oncologists – parses VCF & scans, returns YAML summary for the Berkeley Hackathon.",
    tags=["oncology", "vcf", "radiology", "hackathon", "berkeley"]
)

print("✅ Agent registered in Agentverse")
print("You can now find your agent in the Agentverse marketplace.") 