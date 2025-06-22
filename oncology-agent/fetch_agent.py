from uagents import Agent, Context
from uagents.setup import fund_agent_if_low
from messages import VCFScanRequest, YAMLReply
from pipeline import run_pipeline
import os

# The mailbox connection is the simplest way to connect to Agentverse
# It does not require manual endpoint configuration.
BOT = Agent(
    name="oncology_copilot",
    seed="oncology_copilot_seed",
    port=8000,
    mailbox=os.getenv("AGENTVERSE_API_KEY"),
)

fund_agent_if_low(BOT.wallet.address())

@BOT.on_message(model=VCFScanRequest)
async def handle(ctx: Context, sender: str, msg: VCFScanRequest):
    ctx.logger.info(f"🩺 Analysing patient {msg.patient_id} for agent {sender}")
    yaml_report = run_pipeline(str(msg.vcf_url), str(msg.image_url) if msg.image_url else None, msg.patient_id)
    await ctx.send(sender, YAMLReply(yaml=yaml_report))
    ctx.logger.info(f"✅ Report sent to {sender}")

if __name__ == "__main__":
    print("Oncology Copilot Agent")
    print(f"Agent address: {BOT.address}")
    BOT.run() 