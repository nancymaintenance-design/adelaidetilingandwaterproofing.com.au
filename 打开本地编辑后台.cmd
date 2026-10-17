@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0start-local-admin.ps1"
if errorlevel 1 pause
