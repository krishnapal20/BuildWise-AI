@echo off
set "PATH=C:\Users\Krishnapal Singh\.local\bin;%PATH%"
echo Starting BuildWise AI Backend on port 8000...
uv run --with-requirements requirements.txt python main.py
pause
