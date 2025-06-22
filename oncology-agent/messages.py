from pydantic import BaseModel, HttpUrl
from typing import Optional

class VCFScanRequest(BaseModel):
    vcf_url: HttpUrl
    image_url: HttpUrl | None = None
    meeting_notes: Optional[str] = "No meeting notes provided."
    patient_id: str

class FinalReport(BaseModel):
    patient_id: str
    biomarker_report: str
    radiology_report: str
    final_summary: str
    error: Optional[str] = None 

class YAMLReply(BaseModel):
    yaml: str 