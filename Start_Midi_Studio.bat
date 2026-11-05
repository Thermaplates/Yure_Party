@echo off
title MidiSuno Studio Launcher
cd /d "%~dp0\midi"
echo Starting MidiSuno Studio...
start "" http://localhost:8080
python server.py
pause
