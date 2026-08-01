import React, { useState } from 'react';
import { 
  Smartphone, Monitor, Radio, Cpu, Activity, Droplets, 
  Map, Code, Bell, RefreshCw, ChevronDown, Zap
} from 'lucide-react';
import { useSensor } from '../context/SensorContext';

export const MobileFrame = ({ children, activeTab, setActiveTab }) => {
  const { nodes, activeNodeId, setActiveNodeId, isConnected, isSimulating } = useSensor();
  const [isDesktopMode, setIsDesktopMode] = useState(false);

  return (
    <div className="app-container">
      {/* Top Banner Control Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        width: isDesktopMode ? '100%' : '395px',
        maxWidth: '1280px',
        marginBottom: '12px',
        padding: '8px 14px',
        background: 'rgba(6, 20, 14, 0.85)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isConnected ? '#10b981' : '#f59e0b', boxShadow: isConnected ? '0 0 8px #10b981' : 'none' }}></div>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#f0fdf4' }}>
            {isConnected ? 'ESP32 WebSocket Live' : 'Field Sensor Stream Active'}
          </span>
        </div>

        {/* View Mode Toggle Button */}
        <button 
          onClick={() => setIsDesktopMode(!isDesktopMode)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            padding: '6px 12px', 
            background: 'rgba(16, 185, 129, 0.15)', 
            border: '1px solid rgba(16, 185, 129, 0.4)', 
            borderRadius: '12px', 
            color: '#34d399', 
            fontSize: '12px', 
            fontWeight: '600', 
            cursor: 'pointer' 
          }}
        >
          {isDesktopMode ? <Smartphone size={15} /> : <Monitor size={15} />}
          {isDesktopMode ? 'Mobile Phone View' : 'Desktop View'}
        </button>
      </div>

      {/* Main Smartphone / Desktop Frame */}
      <div className={`phone-mockup ${isDesktopMode ? 'desktop-mode' : ''}`}>
        {!isDesktopMode && (
          <div className="phone-notch">
            <div className="camera-lens"></div>
          </div>
        )}

        {/* Phone Header */}
        <div className="phone-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#10b981', color: '#06140e', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
              <Cpu size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#ffffff' }}>
                AgriSmart ESP32
              </h2>
              <p style={{ fontSize: '10px', color: '#86efac', margin: 0 }}>Precision Field Sensor App</p>
            </div>
          </div>

          {/* Node Selector Dropdown */}
          <div style={{ position: 'relative' }}>
            <select 
              value={activeNodeId} 
              onChange={(e) => setActiveNodeId(e.target.value)}
              style={{ 
                background: 'rgba(16, 185, 129, 0.15)', 
                border: '1px solid rgba(16, 185, 129, 0.3)', 
                borderRadius: '10px', 
                color: '#34d399', 
                fontSize: '11px', 
                fontWeight: '600', 
                padding: '6px 10px',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {Object.keys(nodes).map((id) => (
                <option key={id} value={id} style={{ background: '#091a13', color: '#fff' }}>
                  {nodes[id].name.split(' (')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Body Content */}
        <div className="phone-content">
          {children}
        </div>

        {/* Mobile Navigation Bar */}
        <div className="mobile-nav">
          <button 
            className={`nav-item ${activeTab === 'gauges' ? 'active' : ''}`}
            onClick={() => setActiveTab('gauges')}
          >
            <Droplets size={18} />
            <span>Sensors</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'controls' ? 'active' : ''}`}
            onClick={() => setActiveTab('controls')}
          >
            <Zap size={18} />
            <span>Controls</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveTab('trends')}
          >
            <Activity size={18} />
            <span>Trends</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            <Map size={18} />
            <span>Field Map</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            <Code size={18} />
            <span>ESP32 Code</span>
          </button>
        </div>
      </div>
    </div>
  );
};
