import httpx

WMO_WEATHER_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
}

DEFAULT_WEATHER = {
    "temperature_c": 28.0,
    "humidity_percent": 55,
    "wind_speed_kmh": 12.0,
    "precipitation_probability": 10,
    "condition": "Partly cloudy",
    "uv_index": 5.0
}

async def get_weather(city: str) -> dict:
    """
    Fetch current and forecast weather data for a given city via Open-Meteo API.
    Returns structured weather information with fallback defaults on failure.
    """
    if not city or not city.strip():
        return DEFAULT_WEATHER.copy()

    city_clean = city.strip()
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # 1. Geocoding API to resolve coordinates
            geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city_clean}&count=1"
            geo_resp = await client.get(geo_url)
            if geo_resp.status_code != 200:
                return DEFAULT_WEATHER.copy()

            geo_data = geo_resp.json()
            results = geo_data.get("results")
            if not results or len(results) == 0:
                return DEFAULT_WEATHER.copy()

            lat = results[0].get("latitude")
            lon = results[0].get("longitude")
            if lat is None or lon is None:
                return DEFAULT_WEATHER.copy()

            # 2. Forecast API
            forecast_url = (
                f"https://api.open-meteo.com/v1/forecast"
                f"?latitude={lat}&longitude={lon}"
                f"&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code"
                f"&daily=precipitation_probability_max,uv_index_max"
            )
            forecast_resp = await client.get(forecast_url)
            if forecast_resp.status_code != 200:
                return DEFAULT_WEATHER.copy()

            data = forecast_resp.json()
            current = data.get("current", {})
            daily = data.get("daily", {})

            weather_code = current.get("weather_code", 0)
            condition = WMO_WEATHER_CODES.get(weather_code, "Partly cloudy")

            precip_list = daily.get("precipitation_probability_max", [])
            precipitation_probability = precip_list[0] if precip_list and precip_list[0] is not None else 10

            uv_list = daily.get("uv_index_max", [])
            uv_index = uv_list[0] if uv_list and uv_list[0] is not None else 5.0

            return {
                "temperature_c": float(current.get("temperature_2m", 28.0)),
                "humidity_percent": int(current.get("relative_humidity_2m", 55)),
                "wind_speed_kmh": float(current.get("wind_speed_10m", 12.0)),
                "precipitation_probability": int(precipitation_probability),
                "condition": condition,
                "uv_index": float(uv_index)
            }
    except Exception:
        return DEFAULT_WEATHER.copy()
