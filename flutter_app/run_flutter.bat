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
echo 2. Downloading Flutter Packages (flutter pub get)...
cd /d "d:\agriapp\flutter_app"
call flutter pub get

echo.
echo 3. Launching Flutter App (flutter run)...
call flutter run

pause
