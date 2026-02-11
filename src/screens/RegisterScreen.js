import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import api from "../api/apiClient";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!name || !username || !phone || !password) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    try {
      const res = await api.post("/user/register", {
        name,
        username,
        countryCode,
        phone,
        password,
      });

      if (res.data.status) {
        Alert.alert("Success", "Registered successfully");
        navigation.navigate("Login");
      } else {
        Alert.alert("Register Failed", res.data.message);
      }
    } catch (err) {
      console.log("Register API Error:", err.response?.data || err.message);
      Alert.alert("Error", "Something went wrong, try again");
    }
  };

  return (
    <LinearGradient colors={["#446f94e3", "#42738fe3"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.title}>Register</Text>
          <Text style={styles.subTitle}>Create your account 👋</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
          />

          <View style={styles.phoneRow}>
            <TextInput
              style={[styles.input, styles.countryCode]}
              placeholder="+91"
              value={countryCode}
              onChangeText={setCountryCode}
              maxLength={4}
            />
            <TextInput
              style={[styles.input, styles.phoneInput]}
              placeholder="Phone (10 digits)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 12 }}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    elevation: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#42738fe3",
    textAlign: "center",
  },
  subTitle: { fontSize: 14, color: "#696d6fe3", textAlign: "center", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    fontSize: 15,
    backgroundColor: "#fafafa",
    color: "#111",
  },
  phoneRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  countryCode: { flex: 1, marginRight: 5 },
  phoneInput: { flex: 3 },
  button: {
    backgroundColor: "#42738fe3",
    padding: 15,
    borderRadius: 12,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold", textAlign: "center" },
  loginText: { color: "#42738fe3", textAlign: "center", fontSize: 14 },
});
