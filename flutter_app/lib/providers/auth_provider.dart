import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  UserModel? _user;
  String? _token;

  UserModel? get user => _user;
  String? get token => _token;
  bool get isAuthenticated => _token != null;

  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await AuthService.login(email, password);
    if (res['success'] == true) {
      _token = res['token'];
      _user = res['user'];
      notifyListeners();
    }
    return res;
  }

  Future<Map<String, dynamic>> register(String name, String email, String password, String farmName) async {
    final res = await AuthService.register(name, email, password, farmName);
    if (res['success'] == true) {
      _token = res['token'];
      _user = res['user'];
      notifyListeners();
    }
    return res;
  }

  void logout() {
    _token = null;
    _user = null;
    notifyListeners();
  }
}
