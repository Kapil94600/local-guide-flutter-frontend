import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { IS_ADMIN_APP } from "../appMode";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../context/AuthContext";
import api from "../api/apiClient";

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert("Error", "Phone & password are required");
      return;
    }

    try {
      const res = await api.post("/user/login", { phone, password });
      if (res.data.status) {
        const userData = res.data.data;
        const token = userData.token;
        await AsyncStorage.setItem("token", token);
        login({ ...userData, token });
      } else {
        Alert.alert("Login Failed", res.data.message);
      }
    } catch (err) {
      Alert.alert("Error", "Invalid phone or password");
    }
  };

  return (
    <LinearGradient colors={["#446f94e3", "#42738fe3"]} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {IS_ADMIN_APP ? "Admin Login" : "User Login"}
        </Text>
        <Text style={styles.subTitle}>Welcome back 👋</Text>

        <TextInput
          placeholder="Phone Number"
          placeholderTextColor="#999"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>

        {!IS_ADMIN_APP && (
          <TouchableOpacity
            onPress={() => navigation.navigate("RegisterScreen")}
          >
            <Text style={{ color: "#42738fe3", textAlign: "center", marginTop: 15 }}>
              Don't have an account? Register here
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 25,
    elevation: 12,
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#42738fe3", textAlign: "center" },
  subTitle: { fontSize: 15, color: "#666", textAlign: "center", marginBottom: 25 },
  input: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 12,
    padding: 14, marginBottom: 15, fontSize: 15, backgroundColor: "#fafafa",
  },
  button: { backgroundColor: "#42738fe3", padding: 15, borderRadius: 14, marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold", textAlign: "center" },
});
