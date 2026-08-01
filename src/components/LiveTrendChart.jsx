import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import { useSensor } from '../context/SensorContext';

export const LiveTrendChart = () => {
  const { activeNode } = useSensor();

  if (!activeNode || !activeNode.history) return null;

  const data = activeNode.history;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Real-time Streaming Soil Moisture Graph */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#10b981" />
            <h3 style={{ fontSize: '15px', fontWeight: '600' }}>Live Soil Moisture Telemetry (%)</h3>
          </div>
          <span style={{ fontSize: '11px', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
            Live Stream
          </span>
        </div>

        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.1)" />
              <XAxis dataKey="time" stroke="#86efac" fontSize={10} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#86efac" fontSize={10} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: '#091a13', borderColor: '#10b981', borderRadius: '8px', fontSize: '12px', color: '#fff' }} 
              />
              <Line 
                type="monotone" 
                dataKey="moisture" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{ r: 3, fill: '#10b981' }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Temperature & Humidity Combined Chart */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#38bdf8" />
            <h3 style={{ fontSize: '15px', fontWeight: '600' }}>Temperature vs Air Humidity</h3>
          </div>
        </div>

        <div style={{ width: '100%', height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 189, 248, 0.1)" />
              <XAxis dataKey="time" stroke="#86efac" fontSize={10} tickLine={false} />
              <YAxis stroke="#86efac" fontSize={10} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: '#091a13', borderColor: '#38bdf8', borderRadius: '8px', fontSize: '12px', color: '#fff' }} 
              />
              <Line type="monotone" dataKey="temp" name="Soil Temp °C" stroke="#f97316" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="airTemp" name="Air Temp °C" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="humidity" name="Humidity %" stroke="#38bdf8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
