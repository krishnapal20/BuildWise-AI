import sys
from pathlib import Path

# Add api directory to sys.path
current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

from main import app

# Vercel ASGI Serverless entrypoint
app = app
