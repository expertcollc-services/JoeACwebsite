@echo off
cd /d "%~dp0"

set PORT=8787

if not exist node_modules (
  echo Installing dependencies...
  call npm install
)

echo Building site pages...
call npm run build:pages

start "ACwebsite Server" cmd /k "cd /d ""%~dp0"" && set PORT=%PORT% && npm run start"
timeout /t 2 >nul

start "" "http://127.0.0.1:%PORT%/index.html"
start "" "http://127.0.0.1:%PORT%/backoffice.html"
