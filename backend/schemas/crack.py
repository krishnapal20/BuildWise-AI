from typing import List, Dict, Any
from pydantic import BaseModel, Field

class CrackResponse(BaseModel):
    cracks_detected: bool = False
    crack_count: int = 0
    cracks: List[Dict[str, Any]] = Field(default_factory=list)
    overall_severity: str = "Unknown"
    structural_integrity_score: int = 0
    repair_methods: List[str] = Field(default_factory=list)
    preventive_measures: List[str] = Field(default_factory=list)
    summary: str = ""
