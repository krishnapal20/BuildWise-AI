from fastapi import APIRouter, HTTPException
try:
    from backend.schemas.knowledge import KnowledgeRequest, KnowledgeResponse
    from backend.services import groq_client
except ImportError:
    from schemas.knowledge import KnowledgeRequest, KnowledgeResponse
    from services import groq_client

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base"])

@router.post("/ask", response_model=KnowledgeResponse)
async def ask_knowledge_base(request: KnowledgeRequest):
    try:
        prompt = (
            f"You are BuildWise AI Knowledge Base, a comprehensive civil engineering and construction encyclopedia.\n"
            f"Category: {request.category}\n"
            f"Question: {request.question}\n\n"
            "Requirements:\n"
            "1. Provide a comprehensive, technically accurate engineering answer based on standard codes (such as Indian Standards IS Codes: IS 456, IS 875, IS 1893, National Building Code NBC, etc., or international equivalents where relevant).\n"
            "2. Extract essential key takeaway bullet points.\n"
            "3. Cite relevant industry codes, manuals, or standard references.\n"
            "4. Suggest relevant related construction topics.\n\n"
            "Return a JSON object with the following exact keys:\n"
            "- 'answer': (detailed technical answer text)\n"
            "- 'key_points': (list of core bullet point takeaways)\n"
            "- 'references': (list of cited standards/codes, e.g. 'IS 456:2000 Plain and Reinforced Concrete')\n"
            "- 'related_topics': (list of related civil engineering search terms)\n"
            "- 'category': (string matching the category)\n"
        )

        raw_result = groq_client.analyze_text(
            prompt=prompt,
            feature_context="knowledge"
        )

        if "error" in raw_result and not raw_result.get("answer"):
            return KnowledgeResponse(
                answer=f"Information regarding '{request.question}': Standard construction practice recommends following the relevant Indian Standards (IS Codes) and manufacturer specifications for quality, safety, and durability.",
                key_points=[
                    "Adhere strictly to structural engineering design standards.",
                    "Verify material grades and batch test certifications prior to placement.",
                    "Ensure adequate curing and environmental protection."
                ],
                references=["IS 456:2000 (Code of Practice for Plain and Reinforced Concrete)", "National Building Code of India (NBC)"],
                related_topics=["Concrete Mix Design", "Curing Methods", "Quality Control on Site"],
                category=request.category
            )

        return KnowledgeResponse(
            answer=str(raw_result.get("answer", "")),
            key_points=list(raw_result.get("key_points", [])),
            references=list(raw_result.get("references", [])),
            related_topics=list(raw_result.get("related_topics", [])),
            category=str(raw_result.get("category", request.category))
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to query knowledge base: {str(e)}")
