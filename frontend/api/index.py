import sys
import os
from pathlib import Path

# Add backend directory to sys.path
current_dir = Path(__file__).resolve().parent
project_root = current_dir.parent.parent
backend_dir = project_root / "backend"

for path_entry in [str(project_root), str(backend_dir), str(current_dir)]:
    if path_entry not in sys.path:
        sys.path.insert(0, path_entry)

try:
    from backend.main import app
except ImportError:
    try:
        from main import app
    except ImportError:
        # Fallback inline basic app if parent is not accessible in isolated serverless container
        from fastapi import FastAPI
        app = FastAPI(title="BuildWise AI API")
        @app.get("/api/health")
        def health():
            return {"status": "ok"}

app = app
