import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/sensor_provider.dart';
import 'controls_screen.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override:
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final sensorProvider = Provider.of<SensorProvider>(context);
    final activeNode = sensorProvider.activeNode;

    return Scaffold(
      backgroundColor: const Color(0xFF06140E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF06140E),
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              authProvider.user?.farmName ?? 'My Smart Farm',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            Text(
              'Welcome, ${authProvider.user?.name ?? "Farmer"}',
              style: const TextStyle(fontSize: 11, color: Color(0xFF86EFAC)),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Colors.redAccent),
            onPressed: () => authProvider.logout(),
          ),
        ],
      ),
      body: activeNode == null
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Active Node Card Header
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0D1F17),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0x3310B981)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              activeNode.name,
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                            Text(
                              'Location: ${activeNode.location}',
                              style: const TextStyle(fontSize: 12, color: Color(0xFF86EFAC)),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0x2610B981),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0x4010B981)),
                          ),
                          child: Row(
                            children: [
                              Container(width: 8, height: 8, decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle)),
                              const SizedBox(width: 6),
                              const Text('ONLINE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF34D399))),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Main Circular Soil Moisture Gauge Card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0D1F17),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0x4010B981)),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.water_drop_rounded, color: Color(0xFF10B981), size: 24),
                                SizedBox(width: 8),
                                Text('Root Soil Moisture', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                              ],
                            ),
                            Text(
                              '${activeNode.soilMoisture}%',
                              style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: activeNode.soilMoisture < 25 ? Colors.redAccent : const Color(0xFF10B981),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        LinearProgressIndicator(
                          value: activeNode.soilMoisture / 100.0,
                          backgroundColor: const Color(0x2610B981),
                          color: activeNode.soilMoisture < 25 ? Colors.redAccent : const Color(0xFF10B981),
                          minHeight: 12,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Sensor Grid Cards
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.4,
                    children: [
                      _buildMetricCard('Soil Temp', '${activeNode.soilTemp}°C', Icons.thermostat, Colors.orangeAccent),
                      _buildMetricCard('Air Temp / Hum', '${activeNode.airTemp}°C / ${activeNode.humidity}%', Icons.cloud, Colors.lightBlueAccent),
                      _buildMetricCard('Solar Light', '${(activeNode.lightLux / 1000).toStringAsFixed(1)}k Lux', Icons.wb_sunny, Colors.amberAccent),
                      _buildMetricCard('Soil EC', '${activeNode.soilEc} dS/m', Icons.bolt, Colors.purpleAccent),
                    ],
                  ),
                ],
              ),
            ),
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: const Color(0xFF06140E),
        selectedItemColor: const Color(0xFF10B981),
        unselectedItemColor: const Color(0xFF86EFAC),
        currentIndex: 0,
        onTap: (index) {
          if (index == 1) {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const ControlsScreen()));
          }
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_rounded), label: 'Sensors'),
          BottomNavigationBarItem(icon: Icon(Icons.power_settings_new_rounded), label: 'Controls'),
        ],
      ),
    );
  }

  Widget _buildMetricCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF0D1F17),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x3310B981)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              Icon(icon, size: 18, color: color),
              const SizedBox(width: 6),
              Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF86EFAC))),
            ],
          ),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
        ],
      ),
    );
  }
}
