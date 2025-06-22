import requests
import yaml

def run_demo_pipeline(vcf_url: str, image_url: str | None, patient_id: str) -> str:
    """
    Demo pipeline that doesn't require external API keys.
    Downloads VCF and returns mock analysis in YAML format.
    """
    try:
        # Download VCF
        vcf_text = requests.get(vcf_url, timeout=30).text[:1000]
        
        # Mock analysis results (replace with real analysis)
        mutations = ["BRCA1:Pathogenic", "EGFR:V600E"] 
        drugs = ["Olaparib", "Erlotinib", "Trastuzumab"]
        trials = ["NCT01928394", "NCT03908988", "NCT02734004"]
        
        # Image analysis (if provided)
        if image_url:
            img_bytes = requests.get(image_url, timeout=30).content
            image_analysis = {
                "tumor_size": "3.2 cm", 
                "location": "Lung, upper lobe",
                "stage": "T2N0M0"
            }
        else:
            image_analysis = "No image supplied"
        
        # Generate summary without external APIs
        summary = f"""
        Patient {patient_id} analysis complete:
        - Found {len(mutations)} actionable mutations
        - {len(drugs)} targeted therapies available  
        - {len(trials)} clinical trials identified
        - VCF file size: {len(vcf_text)} characters processed
        
        Recommendations: Consider genetic counseling and precision oncology consultation.
        """
        
        # Build YAML output
        payload = {
            "patient_id": patient_id,
            "mutations": mutations,
            "drugs": drugs,
            "clinical_trials": trials,
            "image_analysis": image_analysis,
            "summary": summary.strip(),
            "vcf_preview": vcf_text[:200] + "..." if len(vcf_text) > 200 else vcf_text
        }
        
        return yaml.dump(payload, sort_keys=False)
        
    except Exception as e:
        return yaml.dump({"error": f"Demo pipeline failed: {str(e)}"}) 