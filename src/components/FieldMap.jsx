import React from 'react';
import { MapPin, Cpu, Radio, Shield, Layers } from 'lucide-react';
import { useSensor } from '../context/SensorContext';

export const FieldMap = () => {
  const { nodes, activeNodeId, setActiveNodeId } = useSensor();

  const nodePositions = {
    "ESP32_NODE_01": { top: '35%', left: '30%', crop: 'Corn (Sector 4A)', ndvi: '0.82 (Healthy)' },
    "ESP32_NODE_02": { top: '65%', left: '70%', crop: 'Greenhouse Tomatoes', ndvi: '0.89 (High)' },
    "ESP32_NODE_03": { top: '25%', left: '75%', crop: 'Vineyard Slope', ndvi: '0.64 (Moderate)' }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="glass-panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '600' }}>Interactive Field Sensor Map</h3>
            <p style={{ fontSize: '11px', color: '#86efac' }}>Select an ESP32 node pin to view live telemetry</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '4px 8px', borderRadius: '12px' }}>
            <Layers size={14} />
            <span>NDVI Heatmap View</span>
          </div>
        </div>

        {/* Visual Map Container */}
        <div style={{ 
          position: 'relative', 
          width: '100%', 
          height: '240px', 
          borderRadius: '16px', 
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0d2818 0%, #05190e 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}>
          {/* Field Boundaries Overlay Mock */}
          <div style={{ position: 'absolute', top: '20%', left: '15%', width: '35%', height: '50%', border: '2px dashed rgba(16,185,129,0.4)', borderRadius: '12px', background: 'rgba(16,185,129,0.08)' }}>
            <span style={{ position: 'absolute', top: '6px', left: '8px', fontSize: '10px', color: '#86efac', fontWeight: '600' }}>North Acre</span>
          </div>

          <div style={{ position: 'absolute', top: '50%', left: '55%', width: '38%', height: '40%', border: '2px dashed rgba(59,130,246,0.4)', borderRadius: '12px', background: 'rgba(59,130,246,0.08)' }}>
            <span style={{ position: 'absolute', top: '6px', left: '8px', fontSize: '10px', color: '#93c5fd', fontWeight: '600' }}>Greenhouse Zone</span>
          </div>

          {/* Render ESP32 Pin Markers */}
          {Object.keys(nodes).map((id) => {
            const node = nodes[id];
            const pos = nodePositions[id] || { top: '50%', left: '50%' };
            const isActive = id === activeNodeId;
            const isDry = node.soilMoisture < 25;

            return (
              <div 
                key={id}
                onClick={() => setActiveNodeId(id)}
                style={{ 
                  position: 'absolute', 
                  top: pos.top, 
                  left: pos.left,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: isActive ? 20 : 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div style={{ 
                  position: 'relative',
                  width: isActive ? '36px' : '28px',
                  height: isActive ? '36px' : '28px',
                  borderRadius: '50%',
                  background: isDry ? '#ef4444' : isActive ? '#10b981' : '#059669',
                  border: '3px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: isActive ? '0 0 16px #10b981' : '0 4px 10px rgba(0,0,0,0.5)',
                  transition: 'all 0.25s ease'
                }}>
                  <Cpu size={isActive ? 18 : 14} />
                  {node.pumpState && (
                    <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '10px', height: '10px', background: '#38bdf8', borderRadius: '50%', border: '1px solid #fff' }}></span>
                  )}
                </div>

                <div style={{ 
                  background: 'rgba(6,20,14,0.9)', 
                  border: `1px solid ${isActive ? '#10b981' : 'rgba(16,185,129,0.3)'}`,
                  padding: '2px 8px',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: isActive ? '#10b981' : '#f0fdf4',
                  whiteSpace: 'nowrap',
                  marginTop: '4px'
                }}>
                  {node.name.split(' (')[0]} ({node.soilMoisture}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Details Card */}
      {nodes[activeNodeId] && (
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>
              {nodes[activeNodeId].name}
            </h4>
            <span style={{ fontSize: '11px', color: '#86efac' }}>
              ID: {nodes[activeNodeId].id}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
            <div><span style={{ color: '#86efac' }}>Location:</span> {nodes[activeNodeId].location}</div>
            <div><span style={{ color: '#86efac' }}>NDVI Health:</span> {nodePositions[activeNodeId]?.ndvi || '0.80'}</div>
            <div><span style={{ color: '#86efac' }}>Moisture:</span> <strong style={{ color: nodes[activeNodeId].soilMoisture < 25 ? '#ef4444' : '#10b981' }}>{nodes[activeNodeId].soilMoisture}%</strong></div>
            <div><span style={{ color: '#86efac' }}>Pump Relay:</span> <strong style={{ color: nodes[activeNodeId].pumpState ? '#38bdf8' : '#86efac' }}>{nodes[activeNodeId].pumpState ? 'ACTIVE' : 'OFF'}</strong></div>
          </div>
        </div>
      )}
    </div>
  );
};
