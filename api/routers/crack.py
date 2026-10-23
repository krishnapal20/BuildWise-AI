import base64
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
try:
    from backend.schemas.crack import CrackResponse
    from backend.services import groq_client
except ImportError:
    from schemas.crack import CrackResponse
    from services import groq_client

router = APIRouter(prefix="/crack", tags=["Crack Detection"])

@router.post("/detect", response_model=CrackResponse)
async def detect_cracks(
    image: UploadFile = File(...),
    building_part: str = Form("")
):
    try:
        image_bytes = await image.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        image_base64 = base64.b64encode(image_bytes).decode("utf-8")

        prompt = (
            "Analyze this structural surface image for cracks, fissures, spalling, and material degradation. "
            f"Building part / element specified: '{building_part}'.\n\n"
            "Return a JSON object with the following exact keys:\n"
            "- 'cracks_detected': (boolean, true if any crack/structural defect found, false otherwise)\n"
            "- 'crack_count': (integer, number of detected distinct crack formations)\n"
            "- 'cracks': (list of objects, each containing: 'type', 'severity', 'width', 'location', 'probable_cause', 'structural_risk', 'recommended_action')\n"
            "- 'overall_severity': (string, e.g. 'Hairline', 'Minor', 'Moderate', 'Severe', 'Critical', or 'None')\n"
            "- 'structural_integrity_score': (integer between 0 and 100, where 100 is completely intact)\n"
            "- 'repair_methods': (list of strings describing specific engineering repair techniques, e.g. epoxy injection, polyurethane grouting, stitching)\n"
            "- 'preventive_measures': (list of strings describing measures to avoid recurrence)\n"
            "- 'summary': (comprehensive engineering diagnostic summary string)\n"
        )

        raw_result = groq_client.analyze_with_vision(
            image_base64=image_base64,
            prompt=prompt,
            feature_context="crack"
        )

        if "error" in raw_result and not raw_result.get("cracks"):
            return CrackResponse(
                cracks_detected=False,
                crack_count=0,
                cracks=[],
                overall_severity="Unknown",
                structural_integrity_score=75,
                repair_methods=["Clean and monitor surface for differential settlement."],
                preventive_measures=["Control moisture exposure and prevent thermal expansion shocks."],
                summary=f"Crack inspection report: {raw_result.get('error', 'Analysis completed with inconclusive visual cues.')}"
            )

        return CrackResponse(
            cracks_detected=bool(raw_result.get("cracks_detected", False)),
            crack_count=int(raw_result.get("crack_count", 0)),
            cracks=list(raw_result.get("cracks", [])),
            overall_severity=str(raw_result.get("overall_severity", "Minor")),
            structural_integrity_score=int(raw_result.get("structural_integrity_score", 80)),
            repair_methods=list(raw_result.get("repair_methods", [])),
            preventive_measures=list(raw_result.get("preventive_measures", [])),
            summary=str(raw_result.get("summary", "Structural crack analysis completed."))
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to detect cracks: {str(e)}")
