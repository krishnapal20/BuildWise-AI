from typing import List, Dict, Any
from pydantic import BaseModel, Field

class SafetyResponse(BaseModel):
    overall_risk_level: str = "Unknown"
    safety_score: int = 0
    hazards: List[Dict[str, Any]] = Field(default_factory=list)
    ppe_compliance: Dict[str, bool] = Field(default_factory=lambda: {
        "helmets": False,
        "safety_vests": False,
        "gloves": False,
        "safety_boots": False,
        "harnesses": False
    })
    safety_guidelines: List[str] = Field(default_factory=list)
    immediate_actions: List[str] = Field(default_factory=list)
    summary: str = ""
