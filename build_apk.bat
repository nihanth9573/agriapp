@echo off
title AgriSmart ESP32 - Android APK Builder
color 0A
echo =====================================================================
echo            AGRISMART ESP32 ANDROID APK BUILDER
echo =====================================================================
echo.

set ANDROID_HOME=C:\Users\nihan\AppData\Local\Android\Sdk
set JAVA_HOME=C:\Program Files\Java\jdk-17

echo 1. Verifying Web Build Assets...
cd /d "d:\agriapp"
call npm run build

echo.
echo 2. Syncing Capacitor Web Assets to Android...
call npx cap sync android

echo.
echo 3. Compiling Android APK with Gradle...
cd /d "d:\agriapp\android"
call gradlew.bat assembleDebug

echo.
if exist "d:\agriapp\android\app\build\outputs\apk\debug\app-debug.apk" (
    echo =====================================================================
    echo [SUCCESS] APK Compiled Successfully!
    echo.
    copy "d:\agriapp\android\app\build\outputs\apk\debug\app-debug.apk" "d:\agriapp\AgriSmart-ESP32.apk"
    echo APK File Saved To: d:\agriapp\AgriSmart-ESP32.apk
    echo =====================================================================
) else (
    echo [NOTICE] If terminal build had network timeouts downloading Gradle plugins,
    echo you can also open the project folder in Android Studio:
    echo File -> Open -> d:\agriapp\android -> Build -> Build APK(s)
)

pause
