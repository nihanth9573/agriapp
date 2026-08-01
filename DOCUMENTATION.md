# 🌾 AgriSmart ESP32 - Complete System Documentation

---

## ☁️ 24/7 Cloud Deployment via Render.com

Deploying your backend to **Render.com** keeps your server running 24/7 in the cloud for **FREE**, without requiring your personal laptop/PC to be powered on.

```
  ┌─────────────────────────┐               ┌─────────────────────────┐
  │   ESP32 FIELD NODE      │               │   MOBILE PHONE APP /    │
  │   (Field / Greenhouse)  │               │   ANDROID APK           │
  └────────────┬────────────┘               └────────────┬────────────┘
               │                                         │
               │ HTTPS POST                              │ WSS WebSocket
               ▼                                         ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │                   RENDER.COM 24/7 CLOUD SERVER                    │
  │            https://agrismart-esp32-backend.onrender.com           │
  └───────────────────────────────────────────────────────────────────┘
```

### Steps to Deploy to Render.com:

1. **Create Free Render Account**: Sign up at [https://render.com](https://render.com).
2. **Push Code to GitHub**:
   - Create a repository on GitHub and push the code from `d:\agriapp`.
3. **New Web Service on Render**:
   - Click **New +** ➔ **Web Service** on Render.
   - Connect your GitHub repository (`agriapp`).
   - Render automatically detects [render.yaml](file:///d:/agriapp/render.yaml):
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
   - Click **Create Web Service**.
4. **Copy your Live Cloud URL**:
   - Render will give you a live URL, e.g.:
     `https://agrismart-esp32-backend.onrender.com`

---

## 🔌 Hardware Wiring & Pin Mapping

| Sensor / Module | ESP32 Pin | Signal Type | Description & Purpose |
| :--- | :--- | :--- | :--- |
| **Capacitive Soil Moisture v1.2** | `GPIO 34` | Analog Input (ADC1_CH6) | Measures volumetric soil water content |
| **DS18B20 Soil Temp Probe** | `GPIO 4` | Digital Input (OneWire) | Measures soil temperature at root depth |
| **DHT22 Air Temp & Humidity** | `GPIO 15` | Digital Input | Measures ambient temperature & relative humidity |
| **BH1750 Light Sensor** | `GPIO 21` (SDA) / `GPIO 22` (SCL) | I2C Bus | Measures solar irradiance in Lux |
| **Irrigation Relay Pump Switch** | `GPIO 26` | Digital Output | Sends 5V signal to trigger water pump ON/OFF |
| **Battery Divider Pin** | `GPIO 35` | Analog Input (ADC) | Reads battery voltage level percentage |

---

## 💻 Updated ESP32 Cloud Configuration

When using Render, update `SERVER_URL` in `esp32_field_node.ino`:

```cpp
// Replace with your live Render cloud URL
const char* SERVER_URL = "https://agrismart-esp32-backend.onrender.com/api/telemetry";
```

Now your ESP32 board in the field will send data to the cloud 24/7 over any Wi-Fi router or 4G LTE SIM module!
