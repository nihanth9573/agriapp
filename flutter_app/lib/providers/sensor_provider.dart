import 'dart:async';
import 'package:flutter/material.dart';
import '../models/sensor_node_model.dart';
import '../services/sensor_service.dart';

class SensorProvider with ChangeNotifier {
  Map<String, SensorNodeModel> _nodes = {};
  String _activeNodeId = "ESP32_NODE_01";
  Timer? _timer;

  Map<String, SensorNodeModel> get nodes => _nodes;
  String get activeNodeId => _activeNodeId;
  SensorNodeModel? get activeNode => _nodes[_activeNodeId] ?? (_nodes.isNotEmpty ? _nodes.values.first : null);

  SensorProvider() {
    _initData();
    _startPolling();
  }

  void _initData() async {
    _nodes = await SensorService.fetchNodes();
    notifyListeners();
  }

  void _startPolling() {
    _timer = Timer.periodic(const Duration(seconds: 3), (_) async {
      final fetched = await SensorService.fetchNodes();
      if (fetched.isNotEmpty) {
        _nodes = fetched;
        notifyListeners();
      }
    });
  }

  void setActiveNodeId(String id) {
    _activeNodeId = id;
    notifyListeners();
  }

  void togglePump(String nodeId, bool newState) async {
    if (_nodes.containsKey(nodeId)) {
      final current = _nodes[nodeId]!;
      _nodes[nodeId] = SensorNodeModel(
        id: current.id,
        name: current.name,
        location: current.location,
        status: current.status,
        battery: current.battery,
        soilMoisture: current.soilMoisture,
        soilTemp: current.soilTemp,
        airTemp: current.airTemp,
        humidity: current.humidity,
        lightLux: current.lightLux,
        soilEc: current.soilEc,
        flowRate: newState ? 14.5 : 0.0,
        pumpState: newState,
        autoIrrigation: current.autoIrrigation,
        targetMoisture: current.targetMoisture,
      );
      notifyListeners();
    }

    await SensorService.togglePump(nodeId, newState);
  }

  @override:
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
