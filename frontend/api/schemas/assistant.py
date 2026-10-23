from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class AssistantRequest(BaseModel):
    site_name: str
    planned_tasks: Optional[List[str]] = None
    tasks: Optional[List[str]] = None
    workforce_count: int = 10
    site_conditions: str = ""

    def get_tasks(self) -> List[str]:
        if self.planned_tasks:
            return self.planned_tasks
        if self.tasks:
            return self.tasks
        return ["General site supervision and construction tasks"]

class AssistantResponse(BaseModel):
    priorities: List[Dict[str, Any]] = Field(default_factory=list)
    materials_needed: List[str] = Field(default_factory=list)
    equipment_needed: List[str] = Field(default_factory=list)
    safety_checks: List[str] = Field(default_factory=list)
    risk_alerts: List[str] = Field(default_factory=list)
    workforce_allocation: List[Dict[str, Any]] = Field(default_factory=list)
    summary: str = ""
