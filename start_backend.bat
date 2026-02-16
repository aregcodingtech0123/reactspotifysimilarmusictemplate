@echo off
cd /d "%~dp0"
echo Starting FastAPI backend on http://0.0.0.0:8000
echo.
if exist venv\Scripts\activate.bat (
  call venv\Scripts\activate.bat
)
cd scripts
uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
