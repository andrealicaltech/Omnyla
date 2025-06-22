import requests
import os
from PIL import Image
from io import BytesIO
# from openai import OpenAI
# client = OpenAI()

VISION_API_URL = os.getenv("NEXT_PUBLIC_VISION_API_URL", "http://localhost:8000")

def analyze_scan(img_url: str) -> dict:
    """Sends an image URL to the local vision analysis API."""
    if not VISION_API_URL:
        return {"vision_summary": "VISION_API_URL not configured."}

    try:
        # Assuming the vision API has an /analyze endpoint that takes a JSON payload
        response = requests.post(
            f"{VISION_API_URL}/analyze",
            json={"image_url": img_url},
            timeout=60  # Increased timeout for potentially slow models
        )
        response.raise_for_status()  # Raises an HTTPError for bad responses (4xx or 5xx)
        return response.json()  # Assuming the API returns a JSON with the analysis
    except requests.exceptions.RequestException as e:
        # Handle connection errors, timeouts, etc.
        return {"vision_summary": f"Could not connect to Vision API: {e}"}

# def analyze_scan_openai(img_url: str) -> dict:
#     raw = Image.open(BytesIO(requests.get(img_url, timeout=30).content))
#     prompt = "Describe tumor size, location, and staging."
#     resp = client.chat.completions.create(
#         model="gpt-4o-mini",
#         messages=[{"role":"user", "content": prompt}],
#         # images=[raw], This is not a valid parameter for openai<1.0
#         max_tokens=256
#     )
#     # This needs to be adapted for vision-capable models
#     return {"vision_summary": "Vision analysis placeholder"} 