import React, { useState } from 'react';
import { SensorProvider } from './context/SensorContext';
import { MobileFrame } from './components/MobileFrame';
import { LiveSensorGauges } from './components/LiveSensorGauges';
import { RemotePumpController } from './components/RemotePumpController';
import { LiveTrendChart } from './components/LiveTrendChart';
import { FieldMap } from './components/FieldMap';
import { Esp32CodeGenerator } from './components/Esp32CodeGenerator';
import { AlertBanner } from './components/AlertBanner';

function AppContent() {
  const [activeTab, setActiveTab] = useState('gauges');

  return (
    <MobileFrame activeTab={activeTab} setActiveTab={setActiveTab}>
      <AlertBanner />

      {activeTab === 'gauges' && <LiveSensorGauges />}
      {activeTab === 'controls' && <RemotePumpController />}
      {activeTab === 'trends' && <LiveTrendChart />}
      {activeTab === 'map' && <FieldMap />}
      {activeTab === 'code' && <Esp32CodeGenerator />}
    </MobileFrame>
  );
}

export default function App() {
  return (
    <SensorProvider>
      <AppContent />
    </SensorProvider>
  );
}
