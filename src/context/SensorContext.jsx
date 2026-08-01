import React, { createContext, useContext, useState, useEffect } from 'react';

const SensorContext = createContext();

export const SensorProvider = ({ children }) => {
  const [nodes, setNodes] = useState({
    "ESP32_NODE_01": {
      id: "ESP32_NODE_01",
      name: "North Corn Field (Node 1)",
      location: "Sector 4A",
      status: "online",
      battery: 92,
      rssi: -65,
      soilMoisture: 38,
      soilMoistureDeep: 44,
      soilTemp: 22.4,
      airTemp: 27.8,
      humidity: 62,
      lightLux: 48500,
      soilEc: 1.4,
      leafWetness: 12,
      flowRate: 0,
      pumpState: false,
      autoIrrigation: true,
      targetMoisture: 40,
      lastSeen: new Date().toISOString(),
      history: Array.from({ length: 15 }, (_, i) => ({
        time: `${10 + Math.floor(i / 2)}:${(i % 2) * 30 || '00'}`,
        moisture: Math.floor(35 + Math.sin(i) * 6),
        temp: 22 + Math.cos(i) * 1.5,
        airTemp: 26 + i * 0.2,
        humidity: 60 - i * 0.5,
        lux: 40000 + i * 500
      }))
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
      history: Array.from({ length: 15 }, (_, i) => ({
        time: `${10 + Math.floor(i / 2)}:${(i % 2) * 30 || '00'}`,
        moisture: 52 + (i % 3),
        temp: 24.0 + (i % 2) * 0.4,
        airTemp: 29,
        humidity: 75,
        lux: 30000
      }))
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
      history: Array.from({ length: 15 }, (_, i) => ({
        time: `${10 + Math.floor(i / 2)}:${(i % 2) * 30 || '00'}`,
        moisture: 26 - i * 0.3,
        temp: 21,
        airTemp: 26,
        humidity: 48,
        lux: 60000
      }))
    }
  });

  const [activeNodeId, setActiveNodeId] = useState("ESP32_NODE_01");
  const [isConnected, setIsConnected] = useState(false);
  const [isSimulating, setIsSimulating] = useState(true);
  const [alerts, setAlerts] = useState([
    { id: 1, type: "warning", message: "Low Moisture (22%) detected on Vineyard Hill ESP32 Node", time: "2 min ago" }
  ]);

  // Connect to WebSocket Server
  useEffect(() => {
    let ws;
    const connectWS = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.hostname}:5000/ws`;
      
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setIsConnected(true);
          console.log("[SensorContext] Connected to AgriSmart ESP32 WebSocket Server");
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "INIT_STATE" || data.type === "SIMULATED_TICK") {
              setNodes(data.nodes);
            } else if (data.type === "ESP32_UPDATE") {
              setNodes((prev) => ({ ...prev, [data.nodeId]: data.node }));
            } else if (data.type === "PUMP_TOGGLE") {
              setNodes((prev) => {
                if (!prev[data.nodeId]) return prev;
                return {
                  ...prev,
                  [data.nodeId]: {
                    ...prev[data.nodeId],
                    pumpState: data.pumpState,
                    flowRate: data.flowRate
                  }
                };
              });
            }
          } catch (err) {
            console.error("WS Message Error:", err);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          setTimeout(connectWS, 3000); // Auto reconnect
        };
      } catch (e) {
        setIsConnected(false);
      }
    };

    connectWS();

    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Standalone Client Simulation fallback timer (if server not running)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setNodes((prevNodes) => {
        const nextNodes = { ...prevNodes };
        Object.keys(nextNodes).forEach((id) => {
          const node = { ...nextNodes[id] };
          const delta = node.pumpState ? 0.7 : -0.15;
          let newMoisture = Math.min(100, Math.max(5, parseFloat((node.soilMoisture + delta + (Math.random() * 0.4 - 0.2)).toFixed(1))));
          
          if (newMoisture < 25 && !node.pumpState) {
            // Push low moisture alert if not already logged
            if (!alerts.some(a => a.nodeId === id && a.type === 'danger')) {
              setAlerts(prev => [
                { id: Date.now(), nodeId: id, type: "danger", message: `CRITICAL Drought: ${node.name} soil moisture dropped to ${newMoisture}%!`, time: "Just now" },
                ...prev.slice(0, 4)
              ]);
            }
          }

          node.soilMoisture = newMoisture;
          node.soilTemp = parseFloat((node.soilTemp + (Math.random() * 0.2 - 0.1)).toFixed(1));
          node.airTemp = parseFloat((node.airTemp + (Math.random() * 0.2 - 0.1)).toFixed(1));

          const currentHistory = node.history || [];
          node.history = [
            ...currentHistory.slice(-19),
            {
              time: timeLabel,
              moisture: newMoisture,
              temp: node.soilTemp,
              airTemp: node.airTemp,
              humidity: node.humidity,
              lux: node.lightLux
            }
          ];
          nextNodes[id] = node;
        });
        return nextNodes;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating, alerts]);

  // Function to toggle ESP32 Pump Relay remotely
  const togglePump = async (nodeId, newState) => {
    // Optimistic UI update
    setNodes((prev) => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        pumpState: newState,
        flowRate: newState ? 14.5 : 0
      }
    }));

    // Send HTTP command to backend server
    try {
      await fetch('/api/pump/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId, pumpState: newState })
      });
    } catch (e) {
      console.log("[SensorContext] API offline, state updated locally");
    }
  };

  // Trigger test environment scenario (Rain event, Drought, Heatwave)
  const triggerScenario = (scenarioType) => {
    setNodes((prev) => {
      const next = { ...prev };
      const active = { ...next[activeNodeId] };

      if (scenarioType === 'rain') {
        active.soilMoisture = 85;
        active.leafWetness = 95;
        active.airTemp = 21.0;
        active.humidity = 92;
        setAlerts((a) => [{ id: Date.now(), type: "success", message: `Heavy Rain detected on ${active.name}! Soil moisture surged to 85%`, time: "Just now" }, ...a.slice(0, 4)]);
      } else if (scenarioType === 'drought') {
        active.soilMoisture = 14;
        active.pumpState = false;
        active.flowRate = 0;
        setAlerts((a) => [{ id: Date.now(), type: "danger", message: `ALERT: Drought condition simulated on ${active.name} (Moisture: 14%)`, time: "Just now" }, ...a.slice(0, 4)]);
      } else if (scenarioType === 'heatwave') {
        active.airTemp = 41.5;
        active.humidity = 18;
        active.lightLux = 95000;
        setAlerts((a) => [{ id: Date.now(), type: "warning", message: `Extreme Heat Warning: ${active.name} ambient temperature reached 41.5°C`, time: "Just now" }, ...a.slice(0, 4)]);
      }

      next[activeNodeId] = active;
      return next;
    });
  };

  const activeNode = nodes[activeNodeId] || nodes["ESP32_NODE_01"];

  return (
    <SensorContext.Provider value={{
      nodes,
      activeNode,
      activeNodeId,
      setActiveNodeId,
      togglePump,
      triggerScenario,
      alerts,
      setAlerts,
      isConnected,
      isSimulating,
      setIsSimulating
    }}>
      {children}
    </SensorContext.Provider>
  );
};

export const useSensor = () => useContext(SensorContext);
