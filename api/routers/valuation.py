from fastapi import APIRouter, HTTPException
try:
    from backend.schemas.valuation import ValuationRequest, ValuationResponse
    from backend.services import groq_client
except ImportError:
    from schemas.valuation import ValuationRequest, ValuationResponse
    from services import groq_client

router = APIRouter(prefix="/api/valuation", tags=["Valuation"])

@router.post("/estimate", response_model=ValuationResponse)
async def estimate_valuation(request: ValuationRequest):
    try:
        amenities_str = ", ".join(request.amenities) if request.amenities else "Standard amenities"

        prompt = (
            f"Perform an Indian real estate valuation estimate for the following property:\n"
            f"- Location: {request.location}\n"
            f"- Super Built-up / Carpet Area: {request.area_sqft} sq.ft\n"
            f"- Property Type: {request.property_type}\n"
            f"- Bedrooms: {request.bedrooms} BHK\n"
            f"- Building Age: {request.building_age} years\n"
            f"- Amenities: {amenities_str}\n\n"
            "Requirements:\n"
            "1. Base your estimate on real-world Indian tier-1/tier-2 property benchmark pricing.\n"
            "2. All prices, rates, and values MUST be formatted in Indian Rupees (₹ / INR).\n"
            "3. Assess valuation factors (location advantage, infrastructure, age depreciation, connectivity).\n"
            "4. Provide realistic rental yields and annual appreciation prospects.\n\n"
            "Return a JSON object with the following exact keys:\n"
            "- 'estimated_value_inr': (string, e.g. '₹85,00,000')\n"
            "- 'price_per_sqft_inr': (string, e.g. '₹7,200/sq.ft')\n"
            "- 'rental_potential_inr': (string, e.g. '₹28,000/month')\n"
            "- 'roi_percentage': (string, e.g. '4.2%')\n"
            "- 'appreciation_outlook': (string, e.g. '6-8% annual capital appreciation')\n"
            "- 'valuation_factors': (list of objects: 'factor', 'impact', 'weight')\n"
            "- 'market_comparison': (object with: 'min_inr', 'max_inr', 'average_inr')\n"
            "- 'investment_rating': (string, e.g. 'A+', 'Strong Buy', 'Moderate', 'High Yield')\n"
            "- 'summary': (comprehensive valuation commentary string)\n"
        )

        raw_result = groq_client.analyze_text(
            prompt=prompt,
            feature_context="valuation"
        )

        if "error" in raw_result and not raw_result.get("estimated_value_inr"):
            base_sqft_rate = 6500
            total_val = int(request.area_sqft * base_sqft_rate)
            return ValuationResponse(
                estimated_value_inr=f"₹{total_val:,}",
                price_per_sqft_inr=f"₹{base_sqft_rate:,}/sq.ft",
                rental_potential_inr=f"₹{int(total_val * 0.003):,}/month",
                roi_percentage="3.6%",
                appreciation_outlook="5-7% expected annual appreciation based on local micro-market",
                valuation_factors=[
                    {"factor": "Location & Connectivity", "impact": "Positive", "weight": "35%"},
                    {"factor": "Property Age & Condition", "impact": "Neutral", "weight": "25%"},
                    {"factor": "Amenities & Infrastructure", "impact": "Positive", "weight": "20%"},
                    {"factor": "Demand-Supply Dynamics", "impact": "Positive", "weight": "20%"}
                ],
                market_comparison={
                    "min_inr": f"₹{int(total_val * 0.9):,}",
                    "max_inr": f"₹{int(total_val * 1.15):,}",
                    "average_inr": f"₹{total_val:,}"
                },
                investment_rating="Moderate Buy",
                summary=f"Automated benchmark estimate for {request.property_type} in {request.location}."
            )

        return ValuationResponse(
            estimated_value_inr=str(raw_result.get("estimated_value_inr", "₹0")),
            price_per_sqft_inr=str(raw_result.get("price_per_sqft_inr", "₹0")),
            rental_potential_inr=str(raw_result.get("rental_potential_inr", "₹0/month")),
            roi_percentage=str(raw_result.get("roi_percentage", "0%")),
            appreciation_outlook=str(raw_result.get("appreciation_outlook", "")),
            valuation_factors=list(raw_result.get("valuation_factors", [])),
            market_comparison=dict(raw_result.get("market_comparison", {})),
            investment_rating=str(raw_result.get("investment_rating", "Moderate")),
            summary=str(raw_result.get("summary", "Valuation completed."))
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to estimate valuation: {str(e)}")
