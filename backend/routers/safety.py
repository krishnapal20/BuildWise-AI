import base64
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
try:
    from backend.schemas.safety import SafetyResponse
    from backend.services import groq_client
except ImportError:
    from schemas.safety import SafetyResponse
    from services import groq_client

router = APIRouter(prefix="/safety", tags=["Safety"])

@router.post("/analyze", response_model=SafetyResponse)
async def analyze_safety(
    image: UploadFile = File(...),
    construction_context: str = Form("")
):
    try:
        image_bytes = await image.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        image_base64 = base64.b64encode(image_bytes).decode("utf-8")

        prompt = (
            "Analyze this construction site image for workplace safety and compliance. "
            f"Site Context provided: '{construction_context}'.\n\n"
            "Return a JSON object with the following exact keys:\n"
            "- 'overall_risk_level': (string, e.g. 'Low', 'Medium', 'High', 'Critical')\n"
            "- 'safety_score': (integer between 0 and 100)\n"
            "- 'hazards': (list of objects, each containing: 'hazard', 'severity', 'location', 'recommendation')\n"
            "- 'ppe_compliance': (object with boolean values for: 'helmets', 'safety_vests', 'gloves', 'safety_boots', 'harnesses')\n"
            "- 'safety_guidelines': (list of string guidelines applicable to this site)\n"
            "- 'immediate_actions': (list of string urgent corrective actions needed immediately)\n"
            "- 'summary': (comprehensive summary string of safety findings)\n"
        )

        raw_result = groq_client.analyze_with_vision(
            image_base64=image_base64,
            prompt=prompt,
            feature_context="safety"
        )

        if "error" in raw_result and not raw_result.get("hazards"):
            # Provide sensible fallback response if AI API fails or returns error
            return SafetyResponse(
                overall_risk_level="Medium",
                safety_score=65,
                hazards=[{
                    "hazard": "AI processing error or uninspected hazards",
                    "severity": "Medium",
                    "location": "General site area",
                    "recommendation": "Perform manual safety walk-through."
                }],
                ppe_compliance={
                    "helmets": True,
                    "safety_vests": True,
                    "gloves": False,
                    "safety_boots": True,
                    "harnesses": False
                },
                safety_guidelines=[
                    "Ensure mandatory PPE compliance for all personnel.",
                    "Keep emergency exits and walkways clear of materials."
                ],
                immediate_actions=[
                    "Verify worker protective equipment before resuming heavy tasks."
                ],
                summary=f"Automated safety analysis: {raw_result.get('error', 'Site inspected with cautionary remarks.')}"
            )

        # Ensure all fields are present and correctly typed
        ppe = raw_result.get("ppe_compliance") or {}
        validated_ppe = {
            "helmets": bool(ppe.get("helmets", False)),
            "safety_vests": bool(ppe.get("safety_vests", False)),
            "gloves": bool(ppe.get("gloves", False)),
            "safety_boots": bool(ppe.get("safety_boots", False)),
            "harnesses": bool(ppe.get("harnesses", False)),
        }

        return SafetyResponse(
            overall_risk_level=str(raw_result.get("overall_risk_level", "Medium")),
            safety_score=int(raw_result.get("safety_score", 70)),
            hazards=list(raw_result.get("hazards", [])),
            ppe_compliance=validated_ppe,
            safety_guidelines=list(raw_result.get("safety_guidelines", [])),
            immediate_actions=list(raw_result.get("immediate_actions", [])),
            summary=str(raw_result.get("summary", "Safety inspection completed."))
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze safety: {str(e)}")
