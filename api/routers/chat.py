from fastapi import APIRouter, HTTPException
try:
    from backend.schemas.chat import ChatRequest, ChatResponse
    from backend.services import groq_client
except ImportError:
    from schemas.chat import ChatRequest, ChatResponse
    from services import groq_client

router = APIRouter(prefix="/chat", tags=["Chat Assistant"])

@router.post("/message", response_model=ChatResponse)
async def chat_message(request: ChatRequest):
    try:
        action = request.get_action().lower()

        if action == "recommend":
            action_directive = (
                "Provide concrete, actionable engineering recommendations, best practices, "
                "and proactive steps to resolve or optimize this construction challenge."
            )
            response_type = "recommendation"
        elif action == "report":
            action_directive = (
                "Generate a formal, structured construction engineering report section "
                "with executive overview, technical findings, and site recommendations."
            )
            response_type = "report"
        else:  # ask
            action_directive = (
                "Provide a clear, detailed, and professional construction engineering Q&A response."
            )
            response_type = "answer"

        prompt = (
            f"You are BuildWise AI Assistant, an interactive intelligent construction companion.\n"
            f"User Action Mode: {action}\n"
            f"Directive: {action_directive}\n"
            f"User Message: {request.message}\n\n"
            "Requirements:\n"
            "1. Deliver an informative response matching the action mode.\n"
            "2. Identify clear, concrete action items that the project team or site engineer should execute.\n"
            "3. Provide a brief 1-2 sentence executive summary.\n\n"
            "Return a JSON object with the following exact keys:\n"
            "- 'response': (main text content)\n"
            "- 'type': (string matching the response type, e.g. 'answer', 'recommendation', or 'report')\n"
            "- 'action_items': (list of strings representing next immediate steps)\n"
            "- 'summary': (1-2 sentence quick recap)\n"
        )

        raw_result = groq_client.analyze_text(
            prompt=prompt,
            feature_context="chat"
        )

        if "error" in raw_result and not raw_result.get("response"):
            return ChatResponse(
                response=f"Regarding '{request.message}': Construction best practices advise adhering to structural drawings, standard specifications, and verified vendor guidelines.",
                type=response_type,
                action_items=[
                    "Consult project structural consultant or site engineer.",
                    "Verify physical site dimensions and material conformity.",
                    "Log observations in the daily site inspection register."
                ],
                summary="Construction advisory response based on standard engineering protocols."
            )

        return ChatResponse(
            response=str(raw_result.get("response", "")),
            type=str(raw_result.get("type", response_type)),
            action_items=list(raw_result.get("action_items", [])),
            summary=str(raw_result.get("summary", ""))
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process chat message: {str(e)}")
