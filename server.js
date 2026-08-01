import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Store latest state of ESP32 Nodes
let fieldNodes = {
  "ESP32_NODE_01": {
    id: "ESP32_NODE_01",
    name: "North Corn Field (Node 1)",
    location: "Sector 4A",
    status: "online",
    battery: 92,
    rssi: -65,
    soilMoisture: 38,       // %
    soilMoistureDeep: 44,   // % (30cm depth)
    soilTemp: 22.4,         // °C (DS18B20)
    airTemp: 27.8,          // °C (DHT22)
    humidity: 62,           // % (DHT22)
    lightLux: 48500,        // Lux (BH1750)
    soilEc: 1.4,            // dS/m
    leafWetness: 12,        // %
    flowRate: 0,            // L/min
    pumpState: false,
    autoIrrigation: true,
    targetMoisture: 40,
    lastSeen: new Date().toISOString(),
    history: []
  },
  "ESP32_NODE_02": {
    id: "ESP32_NODE_02",
    name: "Greenhouse Alpha (Node 2)",
    location: "Greenhouse Zone B",
    status: "online",
    battery: 98,
    rssi: -52,
    soilMoisture: 55,
    soilMoistureDeep: 58,
    soilTemp: 24.1,
    airTemp: 29.5,
    humidity: 78,
    lightLux: 32000,
    soilEc: 1.8,
    leafWetness: 45,
    flowRate: 12.5,
    pumpState: true,
    autoIrrigation: true,
    targetMoisture: 50,
    lastSeen: new Date().toISOString(),
    history: []
  },
  "ESP32_NODE_03": {
    id: "ESP32_NODE_03",
    name: "Vineyard Hill (Node 3)",
    location: "South Slope",
    status: "online",
    battery: 84,
    rssi: -78,
    soilMoisture: 22,
    soilMoistureDeep: 28,
    soilTemp: 21.0,
    airTemp: 26.2,
    humidity: 48,
    lightLux: 61000,
    soilEc: 1.1,
    leafWetness: 5,
    flowRate: 0,
    pumpState: false,
    autoIrrigation: true,
    targetMoisture: 35,
    lastSeen: new Date().toISOString(),
    history: []
  }
};

// Broadcast payload to all connected mobile clients
function broadcast(data) {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// 1. ESP32 HTTP POST Endpoint: ESP32 sends telemetry here
app.post('/api/telemetry', (req, res) => {
  const { nodeId, soilMoisture, soilTemp, airTemp, humidity, lightLux, soilEc, battery, pumpState } = req.body;
  
  if (!nodeId) {
    return res.status(400).json({ error: "nodeId is required" });
  }

  const existingNode = fieldNodes[nodeId] || {
    id: nodeId,
    name: `ESP32 Node (${nodeId})`,
    location: "Field Zone",
    autoIrrigation: true,
    targetMoisture: 40,
    history: []
  };

  const updatedNode = {
    ...existingNode,
    status: "online",
    soilMoisture: soilMoisture !== undefined ? Number(soilMoisture) : existingNode.soilMoisture,
    soilTemp: soilTemp !== undefined ? Number(soilTemp) : existingNode.soilTemp,
    airTemp: airTemp !== undefined ? Number(airTemp) : existingNode.airTemp,
    humidity: humidity !== undefined ? Number(humidity) : existingNode.humidity,
    lightLux: lightLux !== undefined ? Number(lightLux) : existingNode.lightLux,
    soilEc: soilEc !== undefined ? Number(soilEc) : existingNode.soilEc,
    battery: battery !== undefined ? Number(battery) : existingNode.battery,
    pumpState: pumpState !== undefined ? Boolean(pumpState) : existingNode.pumpState,
    lastSeen: new Date().toISOString()
  };

  // Keep last 30 history points
  const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  updatedNode.history = [
    ...(existingNode.history || []).slice(-29),
    {
      time: timeLabel,
      moisture: updatedNode.soilMoisture,
      temp: updatedNode.soilTemp,
      airTemp: updatedNode.airTemp,
      humidity: updatedNode.humidity,
      lux: updatedNode.lightLux
    }
  ];

  fieldNodes[nodeId] = updatedNode;

  // Broadcast real-time update to phone apps
  broadcast({ type: "ESP32_UPDATE", nodeId, node: updatedNode });

  console.log(`[ESP32 Telemetry] Received from ${nodeId}: Moisture=${updatedNode.soilMoisture}% Temp=${updatedNode.soilTemp}°C`);

  return res.json({
    success: true,
    serverTime: new Date().toISOString(),
    pumpCommand: updatedNode.pumpState // Send desired pump state back to ESP32
  });
});

// 2. Mobile App Remote Control Endpoint: Phone app toggles ESP32 relay pump
app.post('/api/pump/toggle', (req, res) => {
  const { nodeId, pumpState } = req.body;
  if (!fieldNodes[nodeId]) {
    return res.status(404).json({ error: "Node not found" });
  }

  fieldNodes[nodeId].pumpState = Boolean(pumpState);
  fieldNodes[nodeId].flowRate = fieldNodes[nodeId].pumpState ? 14.2 : 0;
  fieldNodes[nodeId].lastSeen = new Date().toISOString();

  broadcast({ type: "PUMP_TOGGLE", nodeId, pumpState: fieldNodes[nodeId].pumpState, flowRate: fieldNodes[nodeId].flowRate });

  console.log(`[Mobile Command] Pump for ${nodeId} set to: ${fieldNodes[nodeId].pumpState}`);

  return res.json({ success: true, nodeId, pumpState: fieldNodes[nodeId].pumpState });
});

// 3. Get all nodes
app.get('/api/nodes', (req, res) => {
  res.json({ nodes: fieldNodes });
});

// 4. Simulator tick generator (Simulates live sensors updating every 3 seconds if no physical ESP32 connected)
setInterval(() => {
  const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  Object.keys(fieldNodes).forEach((nodeId) => {
    const node = fieldNodes[nodeId];
    
    // Natural slight fluctuation
    const moistureDelta = node.pumpState ? 0.8 : -0.15;
    let newMoisture = Math.min(100, Math.max(10, parseFloat((node.soilMoisture + moistureDelta + (Math.random() * 0.4 - 0.2)).toFixed(1))));
    let newSoilTemp = parseFloat((node.soilTemp + (Math.random() * 0.2 - 0.1)).toFixed(1));
    let newAirTemp = parseFloat((node.airTemp + (Math.random() * 0.3 - 0.15)).toFixed(1));
    let newHumidity = Math.min(100, Math.max(20, Math.round(node.humidity + (Math.random() * 2 - 1))));
    let newLux = Math.max(0, Math.round(node.lightLux + (Math.random() * 400 - 200)));

    // Auto-irrigation check
    if (node.autoIrrigation) {
      if (newMoisture < node.targetMoisture - 10 && !node.pumpState) {
        node.pumpState = true;
        node.flowRate = 12.8;
      } else if (newMoisture >= node.targetMoisture + 10 && node.pumpState) {
        node.pumpState = false;
        node.flowRate = 0;
      }
    }

    node.soilMoisture = newMoisture;
    node.soilTemp = newSoilTemp;
    node.airTemp = newAirTemp;
    node.humidity = newHumidity;
    node.lightLux = newLux;
    node.lastSeen = new Date().toISOString();

    const currentHistory = node.history || [];
    node.history = [
      ...currentHistory.slice(-29),
      {
        time: timeLabel,
        moisture: newMoisture,
        temp: newSoilTemp,
        airTemp: newAirTemp,
        humidity: newHumidity,
        lux: newLux
      }
    ];
  });

  broadcast({ type: "SIMULATED_TICK", nodes: fieldNodes });
}, 3000);

// WebSocket handling
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: "INIT_STATE", nodes: fieldNodes }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'TOGGLE_PUMP') {
        if (fieldNodes[data.nodeId]) {
          fieldNodes[data.nodeId].pumpState = data.pumpState;
          fieldNodes[data.nodeId].flowRate = data.pumpState ? 14.5 : 0;
          broadcast({ type: "PUMP_TOGGLE", nodeId: data.nodeId, pumpState: data.pumpState, flowRate: fieldNodes[data.nodeId].flowRate });
        }
      }
    } catch (e) {
      console.error('WS Error parsing message:', e);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[AgriSmart ESP32 Server] Running on http://localhost:${PORT}`);
  console.log(`[AgriSmart ESP32 Telemetry] Waiting for ESP32 POST requests at http://localhost:${PORT}/api/telemetry`);
});
