import os
import json
from anthropic import Anthropic
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def make_biomarker_report(patient_id: str, vcf_data: dict) -> str:
    """Uses Anthropic to generate a clinical biomarker/pathology report from VCF data."""
    prompt = f"""
    You are a clinical pathologist. Based on the following genetic variants for patient {patient_id}, write a concise biomarker report.
    Focus on the clinical significance of each pathogenic variant and potential therapeutic implications.

    Genetic Variants:
    {json.dumps(vcf_data, indent=2)}
    """
    message = client.messages.create(
        model="claude-3-haiku-20240307",  # Use Haiku for speed and cost-effectiveness
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    ).content[0].text
    return message

def make_radiology_report(patient_id: str, scan_data: dict) -> str:
    """Uses Anthropic to generate a clinical radiology report from vision model output."""
    prompt = f"""
    You are a radiologist. Based on the following automated analysis of a scan for patient {patient_id}, write a concise radiology report.
    Interpret the findings, noting tumor size, location, and any staging information present.

    Automated Scan Analysis:
    {json.dumps(scan_data, indent=2)}
    """
    message = client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    ).content[0].text
    return message

def make_final_patient_report(patient_id: str, biomarker_report: str, radiology_report: str, meeting_notes: str) -> str:
    """Uses Anthropic to generate a final, patient-friendly summary report."""
    prompt = f"""
    You are a medical scribe specializing in oncology. Your task is to synthesize three sources of information into a single, patient-friendly summary for patient {patient_id}.
    The summary should be easy to understand, empathetic, and clearly outline the key findings and next steps. Avoid overly technical jargon.

    Source 1: Biomarker Report
    ---
    {biomarker_report}
    ---

    Source 2: Radiology Report
    ---
    {radiology_report}
    ---

    Source 3: Tumor Board Meeting Notes
    ---
    {meeting_notes}
    ---

    Please generate the final, integrated patient summary.
    """
    message = client.messages.create(
        model="claude-3-sonnet-20240229",  # Use Sonnet for the final, higher-quality summary
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
    ).content[0].text
    return message 