/*
  =============================================================================
  AgriSmart ESP32 Precision Field Sensor Node & Relay Controller
  =============================================================================
  Hardware Required:
  1. ESP32 Development Board (NodeMCU-32S / ESP32-WROOM-32)
  2. Capacitive Soil Moisture Sensor v1.2 (Connected to GPIO 34 / ADC1_CH6)
  3. DS18B20 Waterproof Soil Temperature Sensor (Data to GPIO 4 with 4.7k resistor)
  4. DHT22 / DHT11 Air Temperature & Humidity Sensor (Data to GPIO 15)
  5. 5V Relay Module for Irrigation Water Pump (Control Signal to GPIO 26)
  6. 18650 Battery / Solar Charge Controller (ADC voltage monitoring on GPIO 35)

  Required Arduino Libraries:
  - WiFi.h & HTTPClient.h (Built-in ESP32)
  - ArduinoJson (by Benoit Blanchon)
  - DHT sensor library (by Adafruit)
  - OneWire & DallasTemperature (for DS18B20)
  =============================================================================
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// --- Wi-Fi & Server Configuration ---
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASS     = "YOUR_WIFI_PASSWORD";
const char* SERVER_URL    = "https://agrismart-backend-dy6b.onrender.com/api/telemetry"; // Live 24/7 Cloud Telemetry Endpoint
const char* NODE_ID       = "ESP32_NODE_01";

// --- Pin Definitions ---
#define SOIL_MOISTURE_PIN 34  // Analog pin for Soil Moisture
#define SOIL_TEMP_PIN     4   // OneWire pin for DS18B20 Soil Temp
#define DHT_PIN           15  // Digital pin for DHT22 Air Temp & Humidity
#define DHT_TYPE          DHT22
#define RELAY_PUMP_PIN    26  // Relay output pin for Irrigation Water Pump
#define BATTERY_PIN       35  // Battery level voltage divider

// Sensor Calibration values
const int SOIL_DRY_ADC = 3200; // ADC value when sensor is completely dry in air
const int SOIL_WET_ADC = 1400; // ADC value when sensor is submerged in water

// Sensor Instances
DHT dht(DHT_PIN, DHT_TYPE);
OneWire oneWire(SOIL_TEMP_PIN);
DallasTemperature soilTempSensor(&oneWire);

// Global Variables
bool currentPumpState = false;
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL_MS = 5000; // Send telemetry every 5 seconds

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n[AgriSmart ESP32] Initializing Field Sensor Node...");

  // Initialize Pins
  pinMode(RELAY_PUMP_PIN, OUTPUT);
  digitalWrite(RELAY_PUMP_PIN, LOW); // Pump default OFF

  // Initialize Sensors
  dht.begin();
  soilTempSensor.begin();

  // Connect to Wi-Fi
  connectToWiFi();
}

void loop() {
  // Ensure Wi-Fi connection
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }

  // Periodic Telemetry Send
  if (millis() - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = millis();
    sendTelemetryData();
  }
}

void connectToWiFi() {
  Serial.print("[Wi-Fi] Connecting to: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[Wi-Fi] Connected successfully!");
    Serial.print("[Wi-Fi] IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[Wi-Fi] Connection failed. Will retry next cycle...");
  }
}

void sendTelemetryData() {
  // 1. Read Soil Moisture (Analog ADC)
  int rawMoistureADC = analogRead(SOIL_MOISTURE_PIN);
  int soilMoisturePercent = map(rawMoistureADC, SOIL_DRY_ADC, SOIL_WET_ADC, 0, 100);
  soilMoisturePercent = constrain(soilMoisturePercent, 0, 100);

  // 2. Read DS18B20 Soil Temperature
  soilTempSensor.requestTemperatures();
  float soilTempC = soilTempSensor.getTempCByIndex(0);
  if (soilTempC == -127.00) { // Sensor error fallback
    soilTempC = 22.5;
  }

  // 3. Read DHT22 Air Temp & Humidity
  float airTempC = dht.readTemperature();
  float humidity = dht.readHumidity();
  if (isnan(airTempC) || isnan(humidity)) {
    airTempC = 26.5;
    humidity = 60.0;
  }

  // 4. Calculate Battery Percentage
  int rawBatt = analogRead(BATTERY_PIN);
  float battVoltage = (rawBatt / 4095.0) * 2.0 * 3.3 * 1.1; // Divider calculation
  int batteryPercent = map((int)(battVoltage * 100), 330, 420, 0, 100);
  batteryPercent = constrain(batteryPercent, 0, 100);

  // 5. Construct JSON Payload
  StaticJsonDocument<300> doc;
  doc["nodeId"]       = NODE_ID;
  doc["soilMoisture"] = soilMoisturePercent;
  doc["soilTemp"]     = soilTempC;
  doc["airTemp"]      = airTempC;
  doc["humidity"]     = humidity;
  doc["lightLux"]     = 42000; // Optional light sensor reading
  doc["soilEc"]       = 1.4;   // Optional EC sensor reading
  doc["battery"]      = batteryPercent;
  doc["pumpState"]    = currentPumpState;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  // 6. Send HTTP POST to Backend Server
  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  int httpResponseCode = http.POST(jsonPayload);
  Serial.print("[HTTP POST] Response Code: ");
  Serial.println(httpResponseCode);

  if (httpResponseCode > 0) {
    String responseString = http.getString();
    Serial.print("[HTTP Response]: ");
    Serial.println(responseString);

    // Parse command from server (e.g. Remote Pump Activation)
    StaticJsonDocument<200> respDoc;
    DeserializationError error = deserializeJson(respDoc, responseString);
    if (!error && respDoc.containsKey("pumpCommand")) {
      bool desiredPumpState = respDoc["pumpCommand"];
      if (desiredPumpState != currentPumpState) {
        currentPumpState = desiredPumpState;
        digitalWrite(RELAY_PUMP_PIN, currentPumpState ? HIGH : LOW);
        Serial.print("[RELAY PUMP] Toggled state to: ");
        Serial.println(currentPumpState ? "ON (Irrigating)" : "OFF");
      }
    }
  } else {
    Serial.print("[HTTP Error] Failed to send POST request: ");
    Serial.println(http.errorToString(httpResponseCode));
  }

  http.end();
}
