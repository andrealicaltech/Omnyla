import requests
import json
import os
from anthropic import Anthropic
from dotenv import load_dotenv

def parse_vcf(vcf_url: str) -> dict:
    """Download VCF, extract mutations via Anthropic Claude."""
    # Load environment variables and initialize client inside function
    load_dotenv()
    client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    
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
        model="claude-3-sonnet-20240229",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
    ).content[0].text

    # Clean the response to ensure it's valid JSON
    json_response = message.strip().replace("```json", "").replace("```", "").strip()
    
    try:
        return json.loads(json_response)
    except json.JSONDecodeError:
        # If JSON parsing fails, return a structured error
        return [{"gene": "PARSE_ERROR", "mutation": json_response[:100], "clin_sig": "Unable to parse VCF"}] 