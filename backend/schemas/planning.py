from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class PlanningRequest(BaseModel):
    project_type: str
    plot_area: str
    num_floors: Optional[int] = None
    floors: Optional[int] = None
    city: str

    def get_floors(self) -> int:
        return self.num_floors if self.num_floors is not None else (self.floors if self.floors is not None else 1)

class PlanningResponse(BaseModel):
    materials: List[Dict[str, Any]] = Field(default_factory=list)
    total_estimated_cost_inr: str = "₹0"
    cost_breakdown: Dict[str, Any] = Field(default_factory=lambda: {
        "materials_inr": "₹0",
        "labor_inr": "₹0",
        "equipment_inr": "₹0",
        "overhead_inr": "₹0",
        "contingency_inr": "₹0"
    })
    schedule: List[Dict[str, Any]] = Field(default_factory=list)
    visualization_prompt: str = ""
    visualization_url: str = ""
    summary: str = ""
