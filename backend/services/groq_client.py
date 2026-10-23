import os
import re
import json
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()

SYSTEM_PROMPT = """You are BuildWise AI, an expert multimodal construction intelligence assistant.
You possess deep expertise in civil engineering, site safety inspection, structural crack analysis, architectural project planning, construction cost estimation in Indian Rupees (₹/INR), real estate valuation for the Indian market, daily site operations, weather risk assessment, and construction advisory.

CRITICAL INSTRUCTIONS:
1. You MUST respond ONLY with a single valid JSON object.
2. Do NOT include markdown code blocks, markdown text, explanations, or formatting outside the JSON object.
3. All financial and cost figures MUST be calculated and represented in Indian Rupees (INR / ₹).
4. Strictly follow any schema or JSON structure specified in the user's prompt.
"""

def _clean_and_parse_json(text: str) -> dict:
    """Extract and parse JSON from model output."""
    if not text:
        return {"error": "Empty response from AI model"}

    # Attempt direct JSON parsing
    cleaned = text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except Exception:
        pass

    # Fallback to regex r'\{.*\}' with re.DOTALL
    try:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
    except Exception as e:
        return {"error": f"Failed to parse JSON response: {str(e)}"}

    return {"error": "No valid JSON object found in response"}

def _get_client() -> Groq:
    api_key = os.getenv("GROQ_API_KEY", "")
    return Groq(api_key=api_key, timeout=60.0)

def analyze_with_vision(image_base64: str, prompt: str, feature_context: str = "") -> dict:
    """
    Analyze image using Groq's llama-3.2-90b-vision-preview model.
    """
    try:
        client = _get_client()

        # Ensure base64 string has appropriate data URI prefix
        if not image_base64.startswith("data:"):
            image_url = f"data:image/jpeg;base64,{image_base64}"
        else:
            image_url = image_base64

        context_header = f"Feature Context: {feature_context}\n\n" if feature_context else ""
        user_message_content = [
            {
                "type": "text",
                "text": f"{context_header}{prompt}\n\nRemember: Output ONLY valid JSON."
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": image_url
                }
            }
        ]

        vision_model = os.getenv("GROQ_VISION_MODEL", "qwen/qwen3.8-27b")
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message_content}
            ],
            model=vision_model,
            temperature=0.2,
            max_tokens=2048,
        )

        response_text = chat_completion.choices[0].message.content
        return _clean_and_parse_json(response_text)
    except Exception as e:
        return {"error": f"Vision analysis error: {str(e)}"}

def analyze_text(prompt: str, feature_context: str = "") -> dict:
    """
    Analyze text prompt using Groq's llama-3.3-70b-versatile model.
    """
    try:
        client = _get_client()

        context_header = f"Feature Context: {feature_context}\n\n" if feature_context else ""
        user_message = f"{context_header}{prompt}\n\nRemember: Output ONLY valid JSON."

        text_model = os.getenv("GROQ_TEXT_MODEL", "qwen/qwen3.8-27b")
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            model=text_model,
            temperature=0.2,
            max_tokens=2048,
        )

        response_text = chat_completion.choices[0].message.content
        return _clean_and_parse_json(response_text)
    except Exception as e:
        return {"error": f"Text analysis error: {str(e)}"}
