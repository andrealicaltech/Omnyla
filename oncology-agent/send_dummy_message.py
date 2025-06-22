import asyncio
from uagents import Agent, Context
from messages import VCFScanRequest
import time

# This is the address of your main agent, which we are sending a message to
AGENT_ADDRESS = "agent1qfmww97nj43pkl3qyvkwxuey752dc6enlm475ylgv399drpj0urjze29u3m"

# Create a simple agent to send one message
sender_agent = Agent(
    name="dummy_sender",
    seed="dummy_sender_seed_5678",
    port=8001,
)

@sender_agent.on_event("startup")
async def send_message(ctx: Context):
    """Sends a dummy VCF request to the main agent and then stops."""
    patient_id = f"PATIENT_DEMO_{int(time.time())}"
    ctx.logger.info(f"Sending dummy VCF request for {patient_id} to {AGENT_ADDRESS}")
    try:
        await ctx.send(
            AGENT_ADDRESS,
            VCFScanRequest(
                vcf_url="https://raw.githubusercontent.com/genomicsengland/example-files/master/vcf/variant.vcf",
                patient_id=patient_id
            )
        )
        ctx.logger.info("Message sent successfully!")
    except Exception as e:
        ctx.logger.error(f"Error sending message: {e}")

    await asyncio.sleep(2.0)
    ctx.running = False

if __name__ == "__main__":
    print("🚀 Running dummy message sender...")
    sender_agent.run()
    print("✅ Dummy message sender finished.") 