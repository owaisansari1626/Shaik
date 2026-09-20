# Start backend
Write-Host "Starting backend server..." -ForegroundColor Green
Start-Process -NoNewWindow -FilePath "powershell" -ArgumentList "-Command `"cd backend; .\venv\Scripts\python.exe -m uvicorn app.main:app --reload`""

# Start frontend
Write-Host "Starting frontend dev server..." -ForegroundColor Blue
Start-Process -NoNewWindow -FilePath "powershell" -ArgumentList "-Command `"cd frontend; npm run dev`""

Write-Host "ShaikTracker is starting up! Backend at http://localhost:8000 and Frontend at http://localhost:5173" -ForegroundColor Yellow
