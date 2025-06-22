#!/usr/bin/env python3
"""
Corrected startup script for Vision API with Gemini integration
"""

import os
import sys
import subprocess

def start_vision_api():
    """Start the Vision API correctly, from the project root."""
    
    print("🚀 Starting Vision API with Gemini Integration (Corrected)")
    print("-" * 50)

    project_root = os.getcwd()
    vision_api_dir = os.path.join(project_root, 'vision_api')
    venv_dir = os.path.join(vision_api_dir, 'gemini_venv')
    
    if sys.platform == "win32":
        python_executable = os.path.join(venv_dir, 'Scripts', 'python.exe')
        pip_executable = os.path.join(venv_dir, 'Scripts', 'pip.exe')
    else:
        python_executable = os.path.join(venv_dir, 'bin', 'python3')
        pip_executable = os.path.join(venv_dir, 'bin', 'pip3')

    # 1. Check if venv exists and create it if not
    if not os.path.exists(python_executable):
        print(f"🐍 Virtual environment not found at {venv_dir}. Creating it now...")
        try:
            subprocess.run([sys.executable, '-m', 'venv', venv_dir], check=True)
            print("✅ Virtual environment created.")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to create virtual environment: {e}")
            sys.exit(1)

    # 2. Install requirements into the venv
    requirements_path = os.path.join(vision_api_dir, 'requirements.txt')
    print(f"📦 Installing requirements from {requirements_path} into venv...")
    try:
        subprocess.run(
            [pip_executable, 'install', '-r', requirements_path, '--break-system-packages'],
            check=True,
            capture_output=True,
            text=True
        )
        print("✅ Requirements installed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Failed to install requirements. It's possible they are already installed. Error:\n{e.stderr}")

    # 3. Set environment variables
    os.environ['GOOGLE_API_KEY'] = 'AIzaSyCdgWCxwRHG-33_eMR9dbTC6ccWcYssJKQ'
    os.environ['GEMINI_MODEL_ID'] = 'gemini-1.5-flash'
    os.environ['MAX_TOKENS'] = '256'
    os.environ['LOG_LEVEL'] = 'INFO'

    print("✅ Environment variables set for Gemini.")

    # 4. Start the server from the project root
    print("🌐 Starting FastAPI server on http://localhost:8000")
    print("   Running from project root to ensure correct imports.")
    print("   Press Ctrl+C to stop the server.")
    print("-" * 50)

    try:
        # Use the venv's python to run uvicorn
        subprocess.run([
            python_executable, '-m', 'uvicorn', 
            'vision_api.server:app',  # <-- CORRECTED APP PATH
            '--host', '0.0.0.0', 
            '--port', '8000',
            '--reload',
            '--reload-dir', 'vision_api' # Only watch the vision_api dir for changes
        ], cwd=project_root) # Ensure it runs from the project root
    except KeyboardInterrupt:
        print("\n👋 Server stopped.")
    except FileNotFoundError:
        print(f"❌ Error: Could not find '{python_executable}'. Make sure the venv is set up correctly.")
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")

if __name__ == "__main__":
    start_vision_api() 