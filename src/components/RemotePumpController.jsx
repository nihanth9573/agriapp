import React from 'react';
import { Power, Activity, ShieldCheck, Play, RefreshCw, AlertTriangle } from 'lucide-react';
import { useSensor } from '../context/SensorContext';

export const RemotePumpController = () => {
  const { activeNode, activeNodeId, togglePump, triggerScenario } = useSensor();

  if (!activeNode) return null;

  const isPumpOn = activeNode.pumpState;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Remote Relay Control Card */}
      <div className="glass-panel" style={{ padding: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Remote Irrigation Controller</h3>
            <p style={{ fontSize: '12px', color: '#86efac' }}>ESP32 Relay Signal (GPIO 26 Output)</p>
          </div>
          <span className={`pulse-badge ${isPumpOn ? 'online' : ''}`} style={{ background: isPumpOn ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: isPumpOn ? '#34d399' : '#fca5a5' }}>
            <span className="dot" style={{ background: isPumpOn ? '#10b981' : '#ef4444', boxShadow: isPumpOn ? '0 0 8px #10b981' : 'none' }}></span>
            {isPumpOn ? 'VALVE OPEN (IRRIGATING)' : 'VALVE CLOSED'}
          </span>
        </div>

        {/* Big Switch Card */}
        <div style={{ 
          background: isPumpOn ? 'rgba(16, 185, 129, 0.15)' : 'rgba(6, 20, 14, 0.6)', 
          border: `1px solid ${isPumpOn ? '#10b981' : 'rgba(16,185,129,0.2)'}`,
          borderRadius: '16px', 
          padding: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              background: isPumpOn ? '#10b981' : 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isPumpOn ? '#ffffff' : '#6ee7b7',
              boxShadow: isPumpOn ? '0 0 20px rgba(16,185,129,0.6)' : 'none'
            }}>
              <Power size={24} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700' }}>
                {isPumpOn ? 'Water Pump Active' : 'Water Pump Standby'}
              </div>
              <div style={{ fontSize: '12px', color: '#86efac' }}>
                {isPumpOn ? `Water Flow: ${activeNode.flowRate} L/min` : '0 L/min flow rate'}
              </div>
            </div>
          </div>

          <label className="switch">
            <input 
              type="checkbox" 
              checked={isPumpOn} 
              onChange={(e) => togglePump(activeNodeId, e.target.checked)} 
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* Automated Rules Summary */}
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#86efac' }}>
            <ShieldCheck size={16} color="#10b981" />
            <span>Smart Auto-Trigger Rule: Active</span>
          </div>
          <p style={{ fontSize: '11px', color: '#6ee7b7', paddingLeft: '24px' }}>
            ESP32 will automatically trigger relay ON when soil moisture drops below <strong>{activeNode.targetMoisture - 10}%</strong> and turn OFF at <strong>{activeNode.targetMoisture + 10}%</strong>.
          </p>
        </div>
      </div>

      {/* Simulator Test Triggers (Demo real-time updates) */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#86efac', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={16} color="#10b981" />
          <span>Real-Time Sensor Simulator Controls</span>
        </h4>
        <p style={{ fontSize: '11px', color: '#6ee7b7', marginBottom: '12px' }}>
          Test how your mobile phone app handles sudden field weather events and ESP32 telemetry drops:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <button 
            onClick={() => triggerScenario('drought')}
            style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', color: '#fca5a5', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
          >
            🔥 Drought (14%)
          </button>
          <button 
            onClick={() => triggerScenario('rain')}
            style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59,130,246,0.4)', borderRadius: '8px', color: '#93c5fd', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
          >
            🌧️ Heavy Rain
          </button>
          <button 
            onClick={() => triggerScenario('heatwave')}
            style={{ padding: '8px', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: '8px', color: '#fde68a', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
          >
            ☀️ Heatwave (41°C)
          </button>
        </div>
      </div>
    </div>
  );
};
