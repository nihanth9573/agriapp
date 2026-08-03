# 🌾 AgriSmart ESP32 - Complete System Documentation

---

## 📱 Flutter Mobile Application (`d:\agriapp\flutter_app`)

The platform includes a dedicated native **Flutter Mobile Application** built with **Dart, Provider, HTTP, WebSockets, and Material 3 design**.

```
  ┌─────────────────────────────────────────────────────────────┐
  │                 FLUTTER MOBILE APPLICATION                  │
  │                  (d:\agriapp\flutter_app)                   │
  │                                                             │
  │  [Login / Register Screen] ──► JWT Auth Token Storage       │
  │  [Dashboard Screen]        ──► Soil Moisture Gauge & Temp   │
  │  [Remote Pump Controls]    ──► Authorized GPIO 26 Relay     │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                 HTTPS REST API + WSS WebSocket
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │         24/7 CLOUD TELEMETRY SERVER ON RENDER.COM           │
  │            https://agrismart-backend-dy6b.onrender.com       │
  └─────────────────────────────────────────────────────────────┘
```

### Flutter App File Structure:
- `lib/main.dart`: Auth Wrapper & Routing.
- `lib/screens/login_screen.dart`: Farmer authentication view (`farmer@agri.com` / `password123`).
- `lib/screens/register_screen.dart`: Register new farm account.
- `lib/screens/dashboard_screen.dart`: Real-time soil moisture gauge & microclimate metrics.
- `lib/screens/controls_screen.dart`: Authenticated irrigation water pump relay switch.
- `lib/services/`: `auth_service.dart` and `sensor_service.dart`.
- `lib/providers/`: `auth_provider.dart` and `sensor_provider.dart`.
- `run_flutter.bat`: 1-Click launcher script using `D:\flutter\bin`.

---

## 🔐 User Authentication Endpoints (`server.js`)

- `POST /api/auth/register`: Create a new farmer profile (`name`, `email`, `password`, `farmName`).
- `POST /api/auth/login`: Authenticate email & password, returning bearer token.
- `GET /api/auth/me`: Validate active session token.

**Pre-configured Demo Credentials**:
- **Email**: `farmer@agri.com`
- **Password**: `password123`

---

## ☁️ 24/7 Cloud Backend Server

- **Render Live URL**: [`https://agrismart-backend-dy6b.onrender.com`](https://agrismart-backend-dy6b.onrender.com)
- **ESP32 Telemetry Endpoint**: `https://agrismart-backend-dy6b.onrender.com/api/telemetry`
- **WebSocket Live Stream**: `wss://agrismart-backend-dy6b.onrender.com/ws`

---

## 🔌 Hardware Wiring & ESP32 Sketch

- **Capacitive Soil Moisture v1.2**: `GPIO 34` (Analog ADC)
- **DS18B20 Soil Temp Probe**: `GPIO 4` (Digital OneWire)
- **DHT22 Air Temp & Humidity**: `GPIO 15` (Digital)
- **Water Pump Relay Module**: `GPIO 26` (Digital Output)
- **Arduino Sketch**: [esp32_field_node.ino](file:///d:/agriapp/esp32/esp32_field_node.ino)

---

## 🚀 How to Run the Flutter App

1. Double-click **[run_flutter.bat](file:///d:/agriapp/flutter_app/run_flutter.bat)** inside `d:\agriapp\flutter_app`.
2. Log in using the demo account:
   - Email: `farmer@agri.com`
   - Password: `password123`
