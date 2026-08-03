import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/sensor_provider.dart';

class ControlsScreen extends StatelessWidget {
  const ControlsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final sensorProvider = Provider.of<SensorProvider>(context);
    final activeNode = sensorProvider.activeNode;

    if (activeNode == null) return const Scaffold();

    final isPumpOn = activeNode.pumpState;

    return Scaffold(
      backgroundColor: const Color(0xFF06140E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF06140E),
        title: const Text('Remote Irrigation Controller'),
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isPumpOn ? const Color(0x2610B981) : const Color(0xFF0D1F17),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: isPumpOn ? const Color(0xFF10B981) : const Color(0x3310B981)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(Icons.power_settings_new_rounded, size: 32, color: isPumpOn ? const Color(0xFF10B981) : Colors.grey),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isPumpOn ? 'Water Pump Active' : 'Water Pump Standby',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          Text(
                            'Flow: ${activeNode.flowRate} L/min',
                            style: const TextStyle(fontSize: 12, color: Color(0xFF86EFAC)),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Switch(
                    value: isPumpOn,
                    activeColor: const Color(0xFF10B981),
                    onChanged: (val) {
                      sensorProvider.togglePump(activeNode.id, val);
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
