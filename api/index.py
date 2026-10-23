import sys
import os
from pathlib import Path

# Add root and backend to python path for Vercel Serverless execution
current_dir = Path(__file__).resolve().parent
root_dir = current_dir.parent
backend_dir = root_dir / "backend"

for path_entry in [str(root_dir), str(backend_dir)]:
    if path_entry not in sys.path:
        sys.path.insert(0, path_entry)

try:
    from backend.main import app
except ImportError:
    from main import app

# Expose app for Vercel ASGI serverless handler
app = app
