#!/usr/bin/env python3
"""
End-to-end test runner for the Oncology Copilot Agent
This script will:
1. Start the main agent
2. Extract its address 
3. Run the test client
4. Display the results
"""

import subprocess
import time
import re
import signal
import sys
from pathlib import Path

def run_full_test():
    """Run the complete end-to-end test"""
    print("🚀 Starting Oncology Copilot Agent End-to-End Test")
    print("="*60)
    
    # Start the main agent in a subprocess
    print("1️⃣ Starting the main agent...")
    agent_process = subprocess.Popen(
        [sys.executable, "main_agent.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        universal_newlines=True
    )
    
    agent_address = None
    startup_timeout = 30  # seconds
    start_time = time.time()
    
    print("   Waiting for agent to start up...")
    
    # Read output until we find the agent address or timeout
    while time.time() - start_time < startup_timeout:
        line = agent_process.stdout.readline()
        if line:
            print(f"   Agent: {line.strip()}")
            
            # Look for the agent address in the output
            if "Agent address:" in line:
                # Extract the address using regex
                match = re.search(r'agent1[a-zA-Z0-9]+', line)
                if match:
                    agent_address = match.group(0)
                    print(f"   ✅ Found agent address: {agent_address}")
                    break
            
            # Also check for the address in other possible formats
            if line.startswith("agent1"):
                agent_address = line.strip()
                print(f"   ✅ Found agent address: {agent_address}")
                break
        
        # Check if process has terminated unexpectedly
        if agent_process.poll() is not None:
            print("   ❌ Agent process terminated unexpectedly")
            return False
        
        time.sleep(0.1)
    
    if not agent_address:
        print("   ❌ Could not find agent address within timeout")
        agent_process.terminate()
        return False
    
    print("\n2️⃣ Agent is running! Now starting test client...")
    time.sleep(2)  # Give the agent a moment to fully initialize
    
    # Run the test client
    try:
        from test_client import run_test_client
        print(f"   Sending test request to agent: {agent_address}")
        print("   " + "-"*50)
        
        # Run the test client
        run_test_client(agent_address)
        
        print("\n3️⃣ Test completed successfully!")
        
    except Exception as e:
        print(f"   ❌ Test client failed: {e}")
        return False
    
    finally:
        # Clean up: terminate the agent process
        print("\n4️⃣ Cleaning up...")
        agent_process.terminate()
        try:
            agent_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            agent_process.kill()
        print("   ✅ Agent process terminated")
    
    print("\n🎉 End-to-end test completed successfully!")
    print("="*60)
    return True

if __name__ == "__main__":
    success = run_full_test()
    sys.exit(0 if success else 1) 