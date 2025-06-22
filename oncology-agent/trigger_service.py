from flask import Flask, jsonify
import subprocess
import os

app = Flask(__name__)

# Get the absolute path to the directory of the current script
# to ensure we can always find the `send_dummy_message.py` script.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.route('/trigger-dummy-message', methods=['GET'])
def trigger_message():
    """
    This endpoint triggers the dummy message sender script.
    It runs the script in a non-blocking way.
    """
    try:
        script_path = os.path.join(BASE_DIR, 'send_dummy_message.py')
        python_executable = os.path.join(BASE_DIR, 'venv/bin/python')
        
        # Use Popen for non-blocking execution
        subprocess.Popen([python_executable, script_path])
        
        print("✅ Triggered dummy message script.")
        return jsonify({"status": "success", "message": "Dummy message trigger initiated."}), 200
    except Exception as e:
        print(f"❌ Error triggering script: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    # Running on port 8002 to avoid conflicts with the main agent (8000)
    # and the message sender (8001).
    print("🚀 Trigger service running on http://127.0.0.1:8002")
    app.run(port=8002) 