@echo off
title MidiSuno Studio Launcher
cd /d "%~dp0"
echo ============================================================
echo           MidiSuno Studio - AI MIDI Generator
echo ============================================================
echo Starting local web server on port 8080...
start "" http://localhost:8080
python server.py
pause
