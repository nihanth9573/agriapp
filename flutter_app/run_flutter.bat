@echo off
title AgriSmart Flutter App Launcher
color 0A
echo =====================================================================
echo              AGRISMART FLUTTER APP LAUNCHER
echo =====================================================================
echo.

set PATH=D:\flutter\bin;%PATH%

echo 1. Checking Flutter SDK...
call flutter --version

echo.
echo 2. Fetching Flutter Packages...
cd /d "d:\agriapp\flutter_app"
call flutter pub get

echo.
echo 3. Launching Flutter App on Chrome Web Browser...
call flutter run -d chrome

pause
