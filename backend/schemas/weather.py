from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class WeatherRequest(BaseModel):
    planned_activity: Optional[str] = None
    activity: Optional[str] = None
    city: Optional[str] = None
    location: Optional[str] = None
    custom_conditions: str = ""

    def get_activity(self) -> str:
        return self.planned_activity or self.activity or "Concrete Pouring"

    def get_city(self) -> str:
        return self.city or self.location or "Mumbai"

class WeatherResponse(BaseModel):
    weather_data: Dict[str, Any] = Field(default_factory=lambda: {
        "temperature_c": 28.0,
        "temperature": "28°C",
        "humidity_percent": 55,
        "humidity": "55%",
        "wind_speed_kmh": 12.0,
        "wind_speed": "12 km/h",
        "precipitation_probability": 10,
        "precipitation": "10%",
        "condition": "Partly cloudy",
        "uv_index": 5.0
    })
    recommendation: str = "UNKNOWN"  # GO / PROCEED WITH CAUTION / NO-GO
    recommendation_color: str = "gray"  # green / yellow / red
    risks: List[str] = Field(default_factory=list)
    precautions: List[str] = Field(default_factory=list)
    suitable_activities: List[str] = Field(default_factory=list)
    avoid_activities: List[str] = Field(default_factory=list)
    summary: str = ""
