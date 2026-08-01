import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/sensor_node_model.dart';

class SensorService {
  static const String baseUrl = "https://agrismart-backend-dy6b.onrender.com/api";

  static Future<Map<String, SensorNodeModel>> fetchNodes() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/nodes'));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final Map<String, dynamic> nodesJson = data['nodes'] ?? {};

        return nodesJson.map(
          (key, value) => MapEntry(key, SensorNodeModel.fromJson(value)),
        );
      }
    } catch (e) {
      print("SensorService fetchNodes error: $e");
    }
    return {};
  }

  static Future<bool> togglePump(String nodeId, bool state) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/pump/toggle'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'nodeId': nodeId, 'pumpState': state}),
      );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}
