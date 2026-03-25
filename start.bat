@echo off
echo Starting NeuroLock Background Service...
start /b cmd /c ".\venv\Scripts\python.exe -m src.main"

echo Starting NeuroLock UI...
cd ui
start /b cmd /c "npm run dev"

echo Both services started!
echo The dashboard will be available at http://localhost:5173
echo Waiting 5 seconds before opening the browser...
timeout /t 5 /nobreak >nul
start http://localhost:5173
