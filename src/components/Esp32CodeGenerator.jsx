import React, { useState } from 'react';
import { Code, Copy, Check, Download, Wifi, Server, Cpu } from 'lucide-react';
import { useSensor } from '../context/SensorContext';

export const Esp32CodeGenerator = () => {
  const { activeNodeId } = useSensor();
  const [wifiSsid, setWifiSsid] = useState('MyFarm_WiFi');
  const [wifiPass, setWifiPass] = useState('FarmPassword123');
  const [serverIp, setServerIp] = useState('192.168.1.100');
  const [serverPort, setServerPort] = useState('5000');
  const [nodeId, setNodeId] = useState(activeNodeId || 'ESP32_NODE_01');
  const [copied, setCopied] = useState(false);

  const generatedCode = `/*
  =============================================================================
  AgriSmart ESP32 Field Sensor Node Sketch
  Configured for Node ID: ${nodeId}
  =============================================================================
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// --- Wi-Fi & Server Configuration ---
const char* WIFI_SSID     = "${wifiSsid}";
const char* WIFI_PASS     = "${wifiPass}";
const char* SERVER_URL    = "http://${serverIp}:${serverPort}/api/telemetry";
const char* NODE_ID       = "${nodeId}";

// --- Pin Definitions ---
#define SOIL_MOISTURE_PIN 34  // Capacitive Sensor (ADC1_CH6)
#define SOIL_TEMP_PIN     4   // DS18B20 OneWire Pin
#define DHT_PIN           15  // DHT22 Air Temp & Humidity
#define DHT_TYPE          DHT22
#define RELAY_PUMP_PIN    26  // Water Pump Relay Output

const int SOIL_DRY_ADC = 3200;
const int SOIL_WET_ADC = 1400;

DHT dht(DHT_PIN, DHT_TYPE);
OneWire oneWire(SOIL_TEMP_PIN);
DallasTemperature soilTempSensor(&oneWire);

bool currentPumpState = false;
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL_MS = 5000;

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PUMP_PIN, OUTPUT);
  digitalWrite(RELAY_PUMP_PIN, LOW);

  dht.begin();
  soilTempSensor.begin();

  connectToWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }

  if (millis() - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = millis();
    sendTelemetryData();
  }
}

void connectToWiFi() {
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\\nWi-Fi Connected! IP: " + WiFi.localIP().toString());
  }
}

void sendTelemetryData() {
  int rawMoistureADC = analogRead(SOIL_MOISTURE_PIN);
  int soilMoisturePercent = map(rawMoistureADC, SOIL_DRY_ADC, SOIL_WET_ADC, 0, 100);
  soilMoisturePercent = constrain(soilMoisturePercent, 0, 100);

  soilTempSensor.requestTemperatures();
  float soilTempC = soilTempSensor.getTempCByIndex(0);
  if (soilTempC == -127.00) soilTempC = 22.5;

  float airTempC = dht.readTemperature();
  float humidity = dht.readHumidity();
  if (isnan(airTempC)) airTempC = 25.0;
  if (isnan(humidity)) humidity = 60.0;

  StaticJsonDocument<300> doc;
  doc["nodeId"]       = NODE_ID;
  doc["soilMoisture"] = soilMoisturePercent;
  doc["soilTemp"]     = soilTempC;
  doc["airTemp"]      = airTempC;
  doc["humidity"]     = humidity;
  doc["pumpState"]    = currentPumpState;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  int httpCode = http.POST(jsonPayload);
  if (httpCode > 0) {
    String response = http.getString();
    StaticJsonDocument<200> respDoc;
    if (!deserializeJson(respDoc, response) && respDoc.containsKey("pumpCommand")) {
      bool desiredState = respDoc["pumpCommand"];
      if (desiredState != currentPumpState) {
        currentPumpState = desiredState;
        digitalWrite(RELAY_PUMP_PIN, currentPumpState ? HIGH : LOW);
      }
    }
  }
  http.end();
}
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadFile = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedCode], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${nodeId.toLowerCase()}_sketch.ino`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="glass-panel" style={{ padding: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Cpu size={22} color="#10b981" />
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>ESP32 Code Generator & Flashing Tool</h3>
            <p style={{ fontSize: '11px', color: '#86efac' }}>Generate ready-to-flash C++ Arduino sketch for your ESP32 board</p>
          </div>
        </div>

        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#86efac', display: 'block', marginBottom: '4px' }}>
              Wi-Fi SSID
            </label>
            <input 
              type="text" 
              value={wifiSsid} 
              onChange={(e) => setWifiSsid(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'rgba(6,20,14,0.8)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#86efac', display: 'block', marginBottom: '4px' }}>
              Wi-Fi Password
            </label>
            <input 
              type="text" 
              value={wifiPass} 
              onChange={(e) => setWifiPass(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'rgba(6,20,14,0.8)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#86efac', display: 'block', marginBottom: '4px' }}>
              Server IP Address
            </label>
            <input 
              type="text" 
              value={serverIp} 
              onChange={(e) => setServerIp(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'rgba(6,20,14,0.8)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#86efac', display: 'block', marginBottom: '4px' }}>
              ESP32 Node ID
            </label>
            <input 
              type="text" 
              value={nodeId} 
              onChange={(e) => setNodeId(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'rgba(6,20,14,0.8)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          <button 
            onClick={copyToClipboard}
            style={{ 
              flex: 1, 
              padding: '10px', 
              background: copied ? '#059669' : '#10b981', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '10px', 
              fontWeight: '600', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '13px'
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Code Copied!' : 'Copy Arduino Sketch'}
          </button>

          <button 
            onClick={downloadFile}
            style={{ 
              padding: '10px 16px', 
              background: 'rgba(16,185,129,0.15)', 
              color: '#34d399', 
              border: '1px solid rgba(16,185,129,0.3)', 
              borderRadius: '10px', 
              fontWeight: '600', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px'
            }}
          >
            <Download size={16} />
            .INO File
          </button>
        </div>

        {/* Code View */}
        <div style={{ 
          background: '#040d09', 
          borderRadius: '12px', 
          padding: '12px', 
          maxHeight: '220px', 
          overflowY: 'auto',
          border: '1px solid rgba(16,185,129,0.2)'
        }}>
          <pre style={{ color: '#a7f3d0', fontSize: '11px', fontFamily: 'monospace', margin: 0, whiteSpace: 'pre-wrap' }}>
            {generatedCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
