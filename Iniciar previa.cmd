@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instale o Node.js para abrir a previa local.
  pause
  exit /b 1
)
node scripts\preview.mjs --open
pause
