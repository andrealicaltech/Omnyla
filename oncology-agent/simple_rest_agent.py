#!/usr/bin/env python3
"""
Simple REST wrapper for the oncology agent
This provides a clean HTTP API that your frontend can call
"""
from flask import Flask, request, jsonify
from pipeline import run_pipeline
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

@app.route('/submit', methods=['POST'])
def submit():
    try:
        data = request.json
        
        # Validate input
        if not data or 'vcf_url' not in data or 'patient_id' not in data:
            return jsonify({"error": "Missing vcf_url or patient_id"}), 400
        
        vcf_url = data['vcf_url']
        image_url = data.get('image_url')
        patient_id = data['patient_id']
        
        app.logger.info(f"🩺 Processing patient {patient_id}")
        app.logger.info(f"📄 VCF URL: {vcf_url}")
        
        # Run the pipeline
        yaml_report = run_pipeline(vcf_url, image_url, patient_id)
        
        app.logger.info("✅ Analysis complete")
        
        return jsonify({
            "status": "success",
            "patient_id": patient_id,
            "yaml_report": yaml_report
        })
        
    except Exception as e:
        app.logger.error(f"❌ Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "oncology-copilot"})

if __name__ == "__main__":
    print("🚀 Oncology Copilot REST API")
    print("📡 Endpoint: http://127.0.0.1:8000/submit")
    print("💊 Health check: http://127.0.0.1:8000/health")
    app.run(host="0.0.0.0", port=8000, debug=True) 