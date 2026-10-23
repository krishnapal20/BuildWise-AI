import sys
import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure both workspace root and backend directory are in sys.path for flexible execution
current_dir = Path(__file__).resolve().parent
parent_dir = current_dir.parent
for path_entry in [str(parent_dir), str(current_dir)]:
    if path_entry not in sys.path:
        sys.path.insert(0, path_entry)

# Load environment variables
load_dotenv()

# Import routers with compatibility fallback
try:
    from backend.routers import (
        safety,
        crack,
        planning,
        valuation,
        assistant,
        weather,
        knowledge,
        chat,
    )
except ImportError:
    from routers import (
        safety,
        crack,
        planning,
        valuation,
        assistant,
        weather,
        knowledge,
        chat,
    )

app = FastAPI(
    title="BuildWise AI API",
    description="Multimodal Construction Intelligence Platform API - Powering site safety, crack diagnostics, cost & schedule planning, property valuation, daily site operations, weather risk analysis, and engineering advisory.",
    version="1.0.0"
)

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Configure CORS for local and production deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers with both /api and empty prefix (for Vercel serverless path compatibility)
api_routers = [
    safety.router,
    crack.router,
    planning.router,
    valuation.router,
    assistant.router,
    weather.router,
    knowledge.router,
    chat.router,
]

for r in api_routers:
    app.include_router(r, prefix="/api")
    app.include_router(r, prefix="")

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "ok", "platform": "BuildWise AI"}

# Check if frontend production build exists and serve it
frontend_dist = current_dir.parent / "frontend" / "dist"
if (frontend_dist / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API routes
        api_prefixes = ("api", "safety", "crack", "planning", "valuation", "assistant", "weather", "knowledge", "chat")
        if any(full_path.startswith(p) for p in api_prefixes):
            from fastapi.responses import JSONResponse
            return JSONResponse(status_code=404, content={"detail": "API endpoint not found"})
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/")
    def root():
        return {"message": "BuildWise AI - Construction Intelligence Platform API"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port)
