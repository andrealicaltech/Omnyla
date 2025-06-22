import requests
import os

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