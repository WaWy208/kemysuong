@echo off
setlocal

set "PORT=%~1"
if "%PORT%"=="" set "PORT=4000"

echo [1/2] Starting API server in a new window...
start "KEM Y SUONG API" cmd /k "cd /d %~dp0 && npm run dev"

echo [2/2] Opening admin page...
timeout /t 3 /nobreak >nul
start "" "http://localhost:%PORT%/admin.html"

echo Done. If your server uses another port, run: start-admin.bat ^<port^>
endlocal
