@echo off
title AgriSmart ESP32 Telemetry & WebSocket Server
color 0A
echo =====================================================================
echo           AGRISMART ESP32 TELEMETRY BACKEND SERVER
echo =====================================================================
echo.
echo Starting Express + WebSocket Server on Port 5000...
echo.
echo ESP32 Telemetry Endpoint : http://localhost:5000/api/telemetry
echo Mobile App WebSocket Path: ws://localhost:5000/ws
echo.
echo Note: If connecting real ESP32 boards on your local Wi-Fi, use your
echo computer's local Wi-Fi IP address (e.g. http://192.168.x.x:5000)
echo.
echo =====================================================================
node server.js
pause
