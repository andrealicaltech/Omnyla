import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
# import vcfpy  # Commented out due to missing dependency
from typing import List, Dict, Any

# Initialize FastAPI app
app = FastAPI(title="PharmGKB Drug Recommendation API")

# Allow CORS for local frontend testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load PharmGKB clinical annotations
PHARMGKB_TSV = "clinical_annotations.tsv"  # Place this file in the same directory
if not os.path.exists(PHARMGKB_TSV):
    raise FileNotFoundError(f"PharmGKB data file '{PHARMGKB_TSV}' not found.")
try:
    pharmgkb_df = pd.read_csv(PHARMGKB_TSV, sep='\t', dtype=str).fillna("")
    # Use the actual column names from the user's file
    required_cols = [
        "Gene",                # Gene
        "Variant/Haplotypes", # Variant
        "Drug(s)",            # Drug
        "Phenotype Category", # Phenotype Category
        "Level of Evidence",  # Level of Evidence
        "Phenotype(s)"        # Annotation/Reasoning
    ]
    for col in required_cols:
        if col not in pharmgkb_df.columns:
            raise ValueError(f"Missing required column in TSV: {col}")
except Exception as e:
    raise RuntimeError(f"Failed to load PharmGKB data: {e}")

def parse_vcf_rsids(file_path: str):
    """Dummy parser: returns a hardcoded list of rsIDs for testing."""
    return ["rs123", "rs456", "rs789"]

def match_variants_to_drugs(rsids: List[str]) -> List[Dict[str, Any]]:
    """Match rsIDs to PharmGKB and extract drug recommendations."""
    matches = []
    for rsid in rsids:
        matched = pharmgkb_df[pharmgkb_df["Variant/Haplotypes"].str.contains(rsid, case=False, na=False)]
        for _, row in matched.iterrows():
            matches.append({
                "gene": row["Gene"],
                "variant": row["Variant/Haplotypes"],
                "drug": row["Drug(s)"],
                "phenotype": row["Phenotype Category"],
                "evidence": row["Level of Evidence"],
                "annotation": row["Phenotype(s)"]
            })
    return matches

@app.post("/predict_drugs")
async def predict_drugs(file: UploadFile = File(...)):
    # Validate file type
    if not file.filename.endswith(".vcf"):
        raise HTTPException(status_code=400, detail="Only .vcf files are accepted.")
    # Save uploaded file temporarily
    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as f:
            f.write(await file.read())
        rsids = parse_vcf_rsids(temp_path)
        predictions = match_variants_to_drugs(rsids)
        response = {
            "variants": rsids,
            "predictions": predictions
        }
        if not predictions:
            response["message"] = "No drug recommendations found for provided variants."
        return JSONResponse(content=response)
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

# --- Suggestions for Improvements ---
# 1. Rank predictions by evidence level (A > B > C > D > E).
# 2. Integrate LLM (e.g., GPT-4) to generate patient-friendly explanations.
# 3. Add authentication for sensitive data.
# 4. Support batch VCF uploads or multiple patients.
# 5. Add logging and monitoring for production use.

# --- Run Instructions ---
# 1. Install dependencies:
#    pip install fastapi uvicorn pandas python-multipart vcfpy
# 2. Place clinical_annotations.tsv in the same directory as main.py.
# 3. Run the server:
#    uvicorn main:app --reload
# 4. Access Swagger UI for testing:
#    http://localhost:8000/docs
#
# --- Sample Frontend Fetch Request ---
# const formData = new FormData();
# formData.append('file', fileInput.files[0]);
# fetch('http://localhost:8000/predict_drugs', {
#   method: 'POST',
#   body: formData
# })
#   .then(res => res.json())
#   .then(data => console.log(data)); 