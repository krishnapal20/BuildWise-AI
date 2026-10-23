from fastapi import APIRouter, HTTPException
try:
    from backend.schemas.weather import WeatherRequest, WeatherResponse
    from backend.services import weather_service, groq_client
except ImportError:
    from schemas.weather import WeatherRequest, WeatherResponse
    from services import weather_service, groq_client

router = APIRouter(prefix="/weather", tags=["Weather Advisory"])

@router.post("/advisory", response_model=WeatherResponse)
async def get_weather_advisory(request: WeatherRequest):
    try:
        target_city = request.get_city()
        target_activity = request.get_activity()

        # 1. Fetch real weather data
        live_weather = await weather_service.get_weather(target_city)
        # Enrich with display helpers
        live_weather["temperature"] = f"{live_weather.get('temperature_c', 28)}°C"
        live_weather["humidity"] = f"{live_weather.get('humidity_percent', 50)}%"
        live_weather["wind_speed"] = f"{live_weather.get('wind_speed_kmh', 10)} km/h"
        live_weather["precipitation"] = f"{live_weather.get('precipitation_probability', 0)}%"

        # 2. Build prompt for AI risk analysis
        prompt = (
            f"You are a Construction Weather Safety and Workability Advisor.\n"
            f"Assess the following real-time weather conditions for the planned construction activity:\n"
            f"- City: {target_city}\n"
            f"- Planned Activity: {target_activity}\n"
            f"- Additional Site Conditions: {request.custom_conditions or 'Standard outdoor site'}\n"
            f"- Real-time Weather Data:\n"
            f"    * Temperature: {live_weather.get('temperature_c')}°C\n"
            f"    * Relative Humidity: {live_weather.get('humidity_percent')}%\n"
            f"    * Wind Speed: {live_weather.get('wind_speed_kmh')} km/h\n"
            f"    * Precipitation Probability: {live_weather.get('precipitation_probability')}%\n"
            f"    * Condition: {live_weather.get('condition')}\n"
            f"    * Max UV Index: {live_weather.get('uv_index')}\n\n"
            "Requirements:\n"
            "1. Give an operational decision recommendation: 'GO', 'PROCEED WITH CAUTION', or 'NO-GO'.\n"
            "2. Map recommendation to color: 'green' for GO, 'yellow' for PROCEED WITH CAUTION, 'red' for NO-GO.\n"
            "3. Detail weather-related hazards (e.g., concrete flash set, slip hazards, crane wind limits, heat stress).\n"
            "4. Provide safety precautions, suitable activities, and activities to avoid.\n\n"
            "Return a JSON object with the following exact keys:\n"
            "- 'recommendation': ('GO' | 'PROCEED WITH CAUTION' | 'NO-GO')\n"
            "- 'recommendation_color': ('green' | 'yellow' | 'red')\n"
            "- 'risks': (list of strings)\n"
            "- 'precautions': (list of strings)\n"
            "- 'suitable_activities': (list of strings)\n"
            "- 'avoid_activities': (list of strings)\n"
            "- 'summary': (summary analysis string)\n"
        )

        raw_result = groq_client.analyze_text(
            prompt=prompt,
            feature_context="weather"
        )

        if "error" in raw_result and not raw_result.get("recommendation"):
            # Fallback heuristic based on live weather data
            precip = live_weather.get("precipitation_probability", 0)
            wind = live_weather.get("wind_speed_kmh", 0)
            temp = live_weather.get("temperature_c", 25)

            if precip > 60 or wind > 40:
                rec = "NO-GO"
                color = "red"
                summary_text = "High precipitation or heavy winds pose severe construction and crane hazard."
            elif precip > 30 or wind > 25 or temp > 38:
                rec = "PROCEED WITH CAUTION"
                color = "yellow"
                summary_text = "Moderate weather risks identified. Follow hydration and wind precautions."
            else:
                rec = "GO"
                color = "green"
                summary_text = "Weather conditions are favorable for construction operations."

            return WeatherResponse(
                weather_data=live_weather,
                recommendation=rec,
                recommendation_color=color,
                risks=["Hydration requirement", "Wind gust monitoring at elevated scaffolding"],
                precautions=["Ensure water points are active", "Secure light loose materials"],
                suitable_activities=["Foundation work", "Brick masonry", "Interior plastering"],
                avoid_activities=["Working without hydration breaks during peak heat"],
                summary=summary_text
            )

        recommendation = str(raw_result.get("recommendation", "PROCEED WITH CAUTION")).upper()
        if "NO-GO" in recommendation:
            color = "red"
        elif "CAUTION" in recommendation:
            color = "yellow"
        elif "GO" in recommendation:
            color = "green"
        else:
            color = raw_result.get("recommendation_color", "yellow")

        return WeatherResponse(
            weather_data=live_weather,
            recommendation=recommendation,
            recommendation_color=color,
            risks=list(raw_result.get("risks", [])),
            precautions=list(raw_result.get("precautions", [])),
            suitable_activities=list(raw_result.get("suitable_activities", [])),
            avoid_activities=list(raw_result.get("avoid_activities", [])),
            summary=str(raw_result.get("summary", "Weather advisory completed."))
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate weather advisory: {str(e)}")
