from typing import List, Dict, Any
from pydantic import BaseModel, Field

class ValuationRequest(BaseModel):
    location: str
    area_sqft: float
    property_type: str
    bedrooms: int = 2
    building_age: int = 0
    amenities: List[str] = Field(default_factory=list)

class ValuationResponse(BaseModel):
    estimated_value_inr: str = "₹0"
    price_per_sqft_inr: str = "₹0"
    rental_potential_inr: str = "₹0/month"
    roi_percentage: str = "0%"
    appreciation_outlook: str = ""
    valuation_factors: List[Dict[str, Any]] = Field(default_factory=list)
    market_comparison: Dict[str, Any] = Field(default_factory=lambda: {
        "min_inr": "₹0",
        "max_inr": "₹0",
        "average_inr": "₹0"
    })
    investment_rating: str = "Unknown"
    summary: str = ""
