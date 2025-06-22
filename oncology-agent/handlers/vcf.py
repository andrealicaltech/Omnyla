import json
import requests
import os
from anthropic import Anthropic

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def parse_vcf(vcf_url: str) -> dict:
    """Download VCF, extract mutations via Anthropic Claude."""
    txt = requests.get(vcf_url, timeout=30).text[:200_000]  # trim huge files
    prompt = f"""
    You are a clinical genomics assistant.
    Extract all pathogenic or likely-pathogenic variants from the VCF below.
    Return only the JSON as a list of objects, with keys "gene", "mutation", and "clin_sig".
    Do not include any other text, just the raw JSON.
    Example: [{{"gene": "BRCA1", "mutation": "c.5266dupC", "clin_sig": "Pathogenic"}}]

    VCF:
    {txt}
    """
    message = client.messages.create(
        model="claude-3-5-sonnet-20240620",
        max_tokens=2048,
        messages=[{{"role": "user", "content": prompt}}],
        temperature=0.1,
    ).content[0].text

    # Clean the response to ensure it's valid JSON
    json_response = message.strip().replace("```json", "").replace("```", "").strip()
    return json.loads(json_response) 