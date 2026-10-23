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

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(safety.router)
app.include_router(crack.router)
app.include_router(planning.router)
app.include_router(valuation.router)
app.include_router(assistant.router)
app.include_router(weather.router)
app.include_router(knowledge.router)
app.include_router(chat.router)

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "ok", "platform": "BuildWise AI"}

@app.get("/")
def root():
    return {"message": "BuildWise AI - Construction Intelligence Platform API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
