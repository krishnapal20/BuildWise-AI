from fastapi import APIRouter, HTTPException
try:
    from backend.schemas.assistant import AssistantRequest, AssistantResponse
    from backend.services import groq_client
except ImportError:
    from schemas.assistant import AssistantRequest, AssistantResponse
    from services import groq_client

router = APIRouter(prefix="/assistant", tags=["Site Assistant"])

@router.post("/daily", response_model=AssistantResponse)
async def plan_daily_operations(request: AssistantRequest):
    try:
        active_tasks = request.get_tasks()
        tasks_list_str = "\n".join([f"- {t}" for t in active_tasks])

        prompt = (
            f"You are an AI Site Supervisor and Construction Operations Planner.\n"
            f"Generate a daily site operational plan for:\n"
            f"- Site Name: {request.site_name}\n"
            f"- Available Workforce: {request.workforce_count} workers\n"
            f"- Site Conditions / Notes: {request.site_conditions or 'Normal working conditions'}\n"
            f"- Planned Tasks:\n{tasks_list_str}\n\n"
            "Requirements:\n"
            "1. Prioritize tasks effectively (High / Medium / Low) with realistic time estimates.\n"
            "2. Identify all materials and machinery/equipment needed for the day.\n"
            "3. Specify critical safety inspections before starting operations.\n"
            "4. Allocate the available workers into functional teams.\n\n"
            "Return a JSON object with the following exact keys:\n"
            "- 'priorities': (list of objects: 'task', 'priority', 'estimated_time')\n"
            "- 'materials_needed': (list of strings)\n"
            "- 'equipment_needed': (list of strings)\n"
            "- 'safety_checks': (list of strings)\n"
            "- 'risk_alerts': (list of strings)\n"
            "- 'workforce_allocation': (list of objects: 'team', 'count', 'task')\n"
            "- 'summary': (concise briefing summary for the morning toolbox talk)\n"
        )

        raw_result = groq_client.analyze_text(
            prompt=prompt,
            feature_context="assistant"
        )

        if "error" in raw_result and not raw_result.get("priorities"):
            # Fallback allocation
            num_teams = max(1, min(4, request.workforce_count // 3))
            workers_per_team = request.workforce_count // num_teams
            fallback_allocation = [
                {"team": f"Team {i+1}", "count": workers_per_team, "task": active_tasks[i] if i < len(active_tasks) else "General Site Support"}
                for i in range(num_teams)
            ]
            return AssistantResponse(
                priorities=[
                    {"task": t, "priority": "High" if idx == 0 else "Medium", "estimated_time": "4-6 hours"}
                    for idx, t in enumerate(active_tasks)
                ],
                materials_needed=["Cement bags", "Water supply", "Reinforcement steel", "Binding wire"],
                equipment_needed=["Concrete mixer", "Vibrator needle", "Safety harnesses", "Ladders"],
                safety_checks=["Pre-shift PPE verification", "Scaffolding stability check", "Electrical line clearance"],
                risk_alerts=["Dust hazard during mixing", "Trip hazards around material staging zone"],
                workforce_allocation=fallback_allocation,
                summary=f"Daily operations briefing for {request.site_name} with {request.workforce_count} personnel deployed."
            )

        return AssistantResponse(
            priorities=list(raw_result.get("priorities", [])),
            materials_needed=list(raw_result.get("materials_needed", [])),
            equipment_needed=list(raw_result.get("equipment_needed", [])),
            safety_checks=list(raw_result.get("safety_checks", [])),
            risk_alerts=list(raw_result.get("risk_alerts", [])),
            workforce_allocation=list(raw_result.get("workforce_allocation", [])),
            summary=str(raw_result.get("summary", "Daily operational plan ready."))
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate daily site plan: {str(e)}")
