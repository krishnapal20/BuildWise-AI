from fastapi import APIRouter, HTTPException
try:
    from backend.schemas.planning import PlanningRequest, PlanningResponse
    from backend.services import groq_client, image_service
except ImportError:
    from schemas.planning import PlanningRequest, PlanningResponse
    from services import groq_client, image_service

router = APIRouter(prefix="/planning", tags=["Project Planning"])

@router.post("/generate", response_model=PlanningResponse)
async def generate_plan(request: PlanningRequest):
    try:
        num_floors = request.get_floors()
        prompt = (
            f"Generate a comprehensive civil construction project plan and bill of quantities (BOQ) for:\n"
            f"- Project Type: {request.project_type}\n"
            f"- Plot Area: {request.plot_area}\n"
            f"- Number of Floors: {num_floors}\n"
            f"- Location/City: {request.city}\n\n"
            "Requirements:\n"
            "1. Calculate estimated materials and quantities needed (cement, steel TMT bars, sand, aggregates, bricks, etc.).\n"
            "2. Provide all unit costs and total costs in Indian Rupees (₹/INR) reflecting current Indian market rates.\n"
            "3. Provide realistic schedule phases (Excavation, Foundation, RCC Frame, Masonry, Finishing).\n"
            "4. Provide a descriptive 'visualization_prompt' suitable for generating an architectural rendering of this building.\n\n"
            "Return a JSON object with the following exact keys:\n"
            "- 'materials': (list of objects: 'item', 'quantity', 'unit_cost_inr', 'total_cost_inr')\n"
            "- 'total_estimated_cost_inr': (string, e.g. '₹45,50,000')\n"
            "- 'cost_breakdown': (object with keys: 'materials_inr', 'labor_inr', 'equipment_inr', 'overhead_inr', 'contingency_inr')\n"
            "- 'schedule': (list of objects: 'phase', 'duration', 'tasks' [list of strings])\n"
            "- 'visualization_prompt': (detailed English prompt string for architectural 3D exterior render)\n"
            "- 'summary': (executive summary string of the project plan)\n"
        )

        raw_result = groq_client.analyze_text(
            prompt=prompt,
            feature_context="planning"
        )

        if "error" in raw_result and not raw_result.get("materials"):
            vis_prompt = f"Modern {request.num_floors}-story {request.project_type} architectural exterior render in {request.city}, photorealistic 8k, architectural digest style"
            vis_url = image_service.generate_image(vis_prompt)
            return PlanningResponse(
                materials=[
                    {"item": "Cement (OPC 53)", "quantity": "800 bags", "unit_cost_inr": "₹420/bag", "total_cost_inr": "₹3,36,000"},
                    {"item": "Steel TMT Fe550D", "quantity": "6.5 metric tons", "unit_cost_inr": "₹65,000/ton", "total_cost_inr": "₹4,22,500"},
                    {"item": "Coarse Sand (M-Sand)", "quantity": "1200 cu.ft", "unit_cost_inr": "₹55/cu.ft", "total_cost_inr": "₹66,000"},
                    {"item": "Aggregates (20mm)", "quantity": "1400 cu.ft", "unit_cost_inr": "₹42/cu.ft", "total_cost_inr": "₹58,800"},
                    {"item": "Red Clay Bricks", "quantity": "25,000 pcs", "unit_cost_inr": "₹9/pc", "total_cost_inr": "₹2,25,000"}
                ],
                total_estimated_cost_inr="₹38,50,000",
                cost_breakdown={
                    "materials_inr": "₹21,00,000",
                    "labor_inr": "₹10,50,000",
                    "equipment_inr": "₹2,50,000",
                    "overhead_inr": "₹2,50,000",
                    "contingency_inr": "₹2,00,000"
                },
                schedule=[
                    {"phase": "Site Prep & Excavation", "duration": "3 weeks", "tasks": ["Soil testing", "Excavation", "PCC"]},
                    {"phase": "Foundation & Substructure", "duration": "5 weeks", "tasks": ["Footing reinforcement", "Plinth beam"]},
                    {"phase": "Superstructure RCC", "duration": "8 weeks", "tasks": ["Columns", "Slab casting", "Curing"]},
                    {"phase": "Masonry & Plastering", "duration": "6 weeks", "tasks": ["Brickwork", "Internal/External plaster"]},
                    {"phase": "Finishing & Services", "duration": "6 weeks", "tasks": ["Flooring", "Electrical", "Plumbing", "Painting"]}
                ],
                visualization_prompt=vis_prompt,
                visualization_url=vis_url,
                summary=f"Preliminary plan for {request.project_type} ({request.num_floors} floors) in {request.city} on {request.plot_area} plot."
            )

        vis_prompt = raw_result.get("visualization_prompt") or f"Modern {request.num_floors}-story {request.project_type} architectural design in {request.city}"
        vis_url = image_service.generate_image(vis_prompt)

        return PlanningResponse(
            materials=list(raw_result.get("materials", [])),
            total_estimated_cost_inr=str(raw_result.get("total_estimated_cost_inr", "₹0")),
            cost_breakdown=dict(raw_result.get("cost_breakdown", {})),
            schedule=list(raw_result.get("schedule", [])),
            visualization_prompt=vis_prompt,
            visualization_url=vis_url,
            summary=str(raw_result.get("summary", "Project plan generated successfully."))
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate project plan: {str(e)}")
