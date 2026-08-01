import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Bell } from 'lucide-react';
import { useSensor } from '../context/SensorContext';

export const AlertBanner = () => {
  const { alerts } = useSensor();

  if (!alerts || alerts.length === 0) return null;

  const latestAlert = alerts[0];

  const iconMap = {
    danger: <AlertCircle size={18} color="#ef4444" />,
    warning: <AlertTriangle size={18} color="#f59e0b" />,
    success: <CheckCircle size={18} color="#10b981" />
  };

  return (
    <div className={`alert-box ${latestAlert.type}`}>
      {iconMap[latestAlert.type] || <Bell size={18} />}
      <div style={{ flex: 1 }}>
        <div>{latestAlert.message}</div>
        <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>{latestAlert.time}</div>
      </div>
    </div>
  );
};
