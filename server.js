import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// In-Memory User Database
let users = {
  "farmer@agri.com": {
    id: "USER_01",
    name: "John Farmer",
    email: "farmer@agri.com",
    password: "password123",
    farmName: "Green Valley Organics",
    token: "token_farmer_secret_123"
  }
};

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
    soilMoistureDeep: 44,   // %
    soilTemp: 22.4,         // °C
    airTemp: 27.8,          // °C
    humidity: 62,           // %
    lightLux: 48500,        // Lux
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

// Broadcast payload to connected WebSocket clients
function broadcast(data) {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// --- AUTHENTICATION ENDPOINTS ---

// 1. User Registration
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, farmName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (users[email]) {
    return res.status(400).json({ error: "Account with this email already exists" });
  }

  const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const newUser = {
    id: `USER_${Date.now()}`,
    name: name || "Farmer",
    email,
    password,
    farmName: farmName || "My Smart Farm",
    token
  };

  users[email] = newUser;
  console.log(`[Auth] Registered new user: ${email}`);

  return res.json({
    success: true,
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, farmName: newUser.farmName }
  });
});

// 2. User Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users[email];

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  console.log(`[Auth] User logged in: ${email}`);
  return res.json({
    success: true,
    token: user.token,
    user: { id: user.id, name: user.name, email: user.email, farmName: user.farmName }
  });
});

// 3. Get Current Profile
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.replace("Bearer ", "");
  const user = Object.values(users).find(u => u.token === token);

  if (!user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  return res.json({ user: { id: user.id, name: user.name, email: user.email, farmName: user.farmName } });
});

// --- SENSOR & TELEMETRY ENDPOINTS ---

// ESP32 Telemetry POST Endpoint
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

  // Broadcast real-time update to Flutter & Web clients
  broadcast({ type: "ESP32_UPDATE", nodeId, node: updatedNode });

  return res.json({
    success: true,
    serverTime: new Date().toISOString(),
    pumpCommand: updatedNode.pumpState
  });
});

// Mobile App Remote Pump Control Endpoint
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

// Get all nodes
app.get('/api/nodes', (req, res) => {
  res.json({ nodes: fieldNodes });
});

// Real-Time Simulation Interval
setInterval(() => {
  const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  Object.keys(fieldNodes).forEach((nodeId) => {
    const node = fieldNodes[nodeId];
    const moistureDelta = node.pumpState ? 0.8 : -0.15;
    let newMoisture = Math.min(100, Math.max(10, parseFloat((node.soilMoisture + moistureDelta + (Math.random() * 0.4 - 0.2)).toFixed(1))));

    node.soilMoisture = newMoisture;
    node.soilTemp = parseFloat((node.soilTemp + (Math.random() * 0.2 - 0.1)).toFixed(1));
    node.airTemp = parseFloat((node.airTemp + (Math.random() * 0.3 - 0.15)).toFixed(1));
    node.humidity = Math.min(100, Math.max(20, Math.round(node.humidity + (Math.random() * 2 - 1))));
    node.lightLux = Math.max(0, Math.round(node.lightLux + (Math.random() * 400 - 200)));
    node.lastSeen = new Date().toISOString();

    const currentHistory = node.history || [];
    node.history = [
      ...currentHistory.slice(-29),
      {
        time: timeLabel,
        moisture: newMoisture,
        temp: node.soilTemp,
        airTemp: node.airTemp,
        humidity: node.humidity,
        lux: node.lightLux
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
  console.log(`[AgriSmart ESP32 Auth Server] Running on http://localhost:${PORT}`);
});
