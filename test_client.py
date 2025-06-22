import asyncio
from uagents import Agent, Context
from messages import VCFScanRequest, FinalReport

# Test client to send requests to the oncology agent
test_client = Agent(name="test_client", seed="my_test_client_seed")

# We'll store the agent address here after we get it from the main agent
AGENT_ADDRESS = None

@test_client.on_event("startup")
async def send_request(ctx: Context):
    if not AGENT_ADDRESS:
        ctx.logger.error("AGENT_ADDRESS not set. Please run the main agent first and copy its address.")
        return
    
    ctx.logger.info(f"Sending request to oncology agent at {AGENT_ADDRESS}")
    
    # Create a test request with sample data
    request = VCFScanRequest(
        vcf_url="https://raw.githubusercontent.com/broadinstitute/gatk/master/src/test/resources/org/broadinstitute/hellbender/tools/walkers/variantutils/SelectVariants/testSelectVariants_VCF.vcf",
        image_url="https://example.com/sample-scan.jpg",  # This will fail gracefully since it's not a real image
        patient_id="test-patient-001",
        meeting_notes="Patient presents with suspected lung cancer. Tumor board recommends genetic testing and imaging analysis to determine treatment options. Patient is a good candidate for targeted therapy if appropriate mutations are found."
    )
    
    await ctx.send(AGENT_ADDRESS, request)
    ctx.logger.info("Request sent! Waiting for response...")

@test_client.on_message(model=FinalReport)
async def handle_report(ctx: Context, sender: str, msg: FinalReport):
    ctx.logger.info(f"✅ Received final report from {sender}")
    print("\n" + "="*80)
    print("🧬 BIOMARKER REPORT")
    print("="*80)
    print(msg.biomarker_report)
    print("\n" + "="*80)
    print("🏥 RADIOLOGY REPORT") 
    print("="*80)
    print(msg.radiology_report)
    print("\n" + "="*80)
    print("📋 FINAL PATIENT SUMMARY")
    print("="*80)
    print(msg.final_summary)
    
    if msg.error:
        print("\n" + "="*80)
        print("❌ ERROR")
        print("="*80)
        print(msg.error)
    
    print("\n" + "="*80)
    print("✅ Test completed successfully!")
    print("="*80)
    
    # Stop the client after receiving the report
    ctx.stop()

def run_test_client(agent_address: str):
    """Run the test client with the given agent address"""
    global AGENT_ADDRESS
    AGENT_ADDRESS = agent_address
    test_client.run()

if __name__ == "__main__":
    print("❌ Please run this using run_full_test() function or provide an agent address")
    print("Example usage:")
    print("  python -c \"from test_client import run_test_client; run_test_client('agent1q...')\"") 