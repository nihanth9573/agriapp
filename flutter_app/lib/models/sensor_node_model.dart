class SensorNodeModel {
  final String id;
  final String name;
  final String location;
  final String status;
  final int battery;
  final double soilMoisture;
  final double soilTemp;
  final double airTemp;
  final int humidity;
  final int lightLux;
  final double soilEc;
  final double flowRate;
  final bool pumpState;
  final bool autoIrrigation;
  final double targetMoisture;

  SensorNodeModel({
    required this.id,
    required this.name,
    required this.location,
    required this.status,
    required this.battery,
    required this.soilMoisture,
    required this.soilTemp,
    required this.airTemp,
    required this.humidity,
    required this.lightLux,
    required this.soilEc,
    required this.flowRate,
    required this.pumpState,
    required this.autoIrrigation,
    required this.targetMoisture,
  });

  factory SensorNodeModel.fromJson(Map<String, dynamic> json) {
    return SensorNodeModel(
      id: json['id'] ?? '',
      name: json['name'] ?? 'ESP32 Node',
      location: json['location'] ?? 'Field',
      status: json['status'] ?? 'online',
      battery: (json['battery'] as num?)?.toInt() ?? 100,
      soilMoisture: (json['soilMoisture'] as num?)?.toDouble() ?? 0.0,
      soilTemp: (json['soilTemp'] as num?)?.toDouble() ?? 0.0,
      airTemp: (json['airTemp'] as num?)?.toDouble() ?? 0.0,
      humidity: (json['humidity'] as num?)?.toInt() ?? 0,
      lightLux: (json['lightLux'] as num?)?.toInt() ?? 0,
      soilEc: (json['soilEc'] as num?)?.toDouble() ?? 0.0,
      flowRate: (json['flowRate'] as num?)?.toDouble() ?? 0.0,
      pumpState: json['pumpState'] ?? false,
      autoIrrigation: json['autoIrrigation'] ?? true,
      targetMoisture: (json['targetMoisture'] as num?)?.toDouble() ?? 40.0,
    );
  }
}
