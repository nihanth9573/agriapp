import React from 'react';
import { Droplets, Thermometer, Sun, Zap, CloudRain, Cpu } from 'lucide-react';
import { useSensor } from '../context/SensorContext';

export const LiveSensorGauges = () => {
  const { activeNode } = useSensor();

  if (!activeNode) return null;

  const moisture = activeNode.soilMoisture;
  const circumference = 2 * Math.PI * 30; // Radius 30
  const dashoffset = circumference - (moisture / 100) * circumference;

  // Determine moisture health color
  let moistureColor = '#10b981'; // Green optimal
  let moistureStatus = 'Optimal';
  if (moisture < 25) {
    moistureColor = '#ef4444'; // Red low
    moistureStatus = 'Dry - Needs Water';
  } else if (moisture > 75) {
    moistureColor = '#3b82f6'; // Blue saturated
    moistureStatus = 'Saturated';
  } else if (moisture < 35) {
    moistureColor = '#f59e0b'; // Amber low-medium
    moistureStatus = 'Low Moisture';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Main Soil Moisture Gauge Card */}
      <div className="glass-panel gauge-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '8px', borderRadius: '10px', color: '#10b981' }}>
              <Droplets size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '600' }}>Root Soil Moisture</h3>
              <p style={{ fontSize: '11px', color: '#86efac' }}>Capacitive Sensor (GPIO 34)</p>
            </div>
          </div>
          <span style={{ fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '12px', background: `${moistureColor}25`, color: moistureColor, border: `1px solid ${moistureColor}40` }}>
            {moistureStatus}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', margin: '12px 0 6px 0' }}>
          {/* Circular SVG Gauge */}
          <div className="gauge-circle" style={{ width: '100px', height: '100px' }}>
            <svg className="gauge-svg" viewBox="0 0 70 70">
              <circle className="gauge-bg" cx="35" cy="35" r="30" />
              <circle
                className="gauge-fill"
                cx="35"
                cy="35"
                r="30"
                stroke={moistureColor}
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
              />
            </svg>
            <div className="gauge-value" style={{ fontSize: '20px' }}>
              {moisture}%
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyBetween: 'space-between', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: '#86efac' }}>10cm Root Depth:</span>
              <strong style={{ fontSize: '12px', color: '#f0fdf4' }}>{moisture}%</strong>
            </div>
            <div style={{ display: 'flex', justifyBetween: 'space-between', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: '#86efac' }}>30cm Deep Soil:</span>
              <strong style={{ fontSize: '12px', color: '#f0fdf4' }}>{activeNode.soilMoistureDeep || moisture + 4}%</strong>
            </div>
            <div style={{ display: 'flex', justifyBetween: 'space-between', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: '#86efac' }}>Target Threshold:</span>
              <strong style={{ fontSize: '12px', color: '#10b981' }}>{activeNode.targetMoisture}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Secondary Sensors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Soil Temp (DS18B20) */}
        <div className="glass-panel" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Thermometer size={18} color="#f97316" />
            <span style={{ fontSize: '12px', color: '#86efac', fontWeight: '500' }}>Soil Temp</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#f0fdf4' }}>
            {activeNode.soilTemp}°C
          </div>
          <span style={{ fontSize: '10px', color: '#6ee7b7' }}>DS18B20 Waterproof</span>
        </div>

        {/* Air Temp & Humidity (DHT22) */}
        <div className="glass-panel" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <CloudRain size={18} color="#38bdf8" />
            <span style={{ fontSize: '12px', color: '#86efac', fontWeight: '500' }}>Air / Humidity</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#f0fdf4' }}>
            {activeNode.airTemp}°C <span style={{ fontSize: '13px', fontWeight: '400', color: '#38bdf8' }}>/ {activeNode.humidity}%</span>
          </div>
          <span style={{ fontSize: '10px', color: '#6ee7b7' }}>DHT22 Sensor (GPIO 15)</span>
        </div>

        {/* Sunlight Lux Meter */}
        <div className="glass-panel" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sun size={18} color="#eab308" />
            <span style={{ fontSize: '12px', color: '#86efac', fontWeight: '500' }}>Solar Irradiance</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#f0fdf4' }}>
            {(activeNode.lightLux / 1000).toFixed(1)}k <span style={{ fontSize: '12px', fontWeight: '400' }}>Lux</span>
          </div>
          <span style={{ fontSize: '10px', color: '#6ee7b7' }}>BH1750 (I2C)</span>
        </div>

        {/* Soil EC / Salinity */}
        <div className="glass-panel" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Zap size={18} color="#a855f7" />
            <span style={{ fontSize: '12px', color: '#86efac', fontWeight: '500' }}>Soil EC / Salinity</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#f0fdf4' }}>
            {activeNode.soilEc} <span style={{ fontSize: '12px', fontWeight: '400' }}>dS/m</span>
          </div>
          <span style={{ fontSize: '10px', color: '#6ee7b7' }}>Optimal Nutrient Level</span>
        </div>
      </div>

      {/* Node Hardware Diagnostics Footer */}
      <div className="glass-panel" style={{ padding: '12px', display: 'flex', justifyContent: 'space-around', fontSize: '11px', color: '#86efac' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Cpu size={14} color="#10b981" />
          <span>Battery: <strong style={{ color: '#f0fdf4' }}>{activeNode.battery}%</strong></span>
        </div>
        <div>
          <span>Wi-Fi RSSI: <strong style={{ color: '#f0fdf4' }}>{activeNode.rssi || -65} dBm</strong></span>
        </div>
        <div>
          <span>Relay Pin: <strong style={{ color: '#10b981' }}>GPIO 26</strong></span>
        </div>
      </div>
    </div>
  );
};
