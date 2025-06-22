from flask import Flask, request, jsonify
from handlers.reporting import make_final_patient_report
import os

app = Flask(__name__)

@app.route('/report', methods=['POST'])
def create_report():
    try:
        data = request.get_json()
        patient_id = data.get('patient_id')
        variants = data.get('variants')
        drugs = data.get('drugs')

        if not all([patient_id, variants, drugs]):
            return jsonify({"error": "Missing required data: patient_id, variants, or drugs"}), 400

        report_context = {
            "variants": variants,
            "drugs": drugs,
        }
        
        report_text = make_final_patient_report(
            patient_id=patient_id,
            biomarker_report=str(report_context),
            radiology_report="Not available.",
            meeting_notes="Not available."
        )
        
        return jsonify({"report": report_text})

    except Exception as e:
        print(f"Error generating report: {e}")
        return jsonify({"error": "Failed to generate report"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8001))
    print(f"Report generation server starting on port {port}...")
    app.run(host='0.0.0.0', port=port) 