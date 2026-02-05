import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import api from "../api/apiClient";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");        // ✅ Full Name
  const [username, setUsername] = useState(""); // ✅ Username
  const [countryCode, setCountryCode] = useState("+91"); // ✅ Default India
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

const handleRegister = async () => {
  try {
    // Step 1: Register user
    const res = await api.post("/user/register", {
      name,
      username,
      countryCode,
      phone,
      password,
    });

    if (res.data.status) {
      const userId = res.data.data.id;

      // Step 2: Role specific request
      if (role === "guider") {
        await api.post("/guider/request", {
          userId,
          firmName: name,
          phone,
          address: "Some address",
          placeId: 1,
          idProofType: "Aadhar",
          // + required files (multipart)
        });
      } else if (role === "photographer") {
        await api.post("/photographers/request", {
          userId,
          firmName: name,
          phone,
          address: "Some address",
          placeId: 1,
          idProofType: "Aadhar",
          // + required files (multipart)
        });
      }

      navigation.navigate("Login");
    } else {
      console.error("Register failed:", res.data.message);
    }
  } catch (err) {
    console.error("Register API Error:", err.response?.data || err.message);
  }
};











  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      {/* Full Name */}
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      {/* Username */}
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

      {/* Phone with Country Code */}
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
          maxLength={10} // ✅ restrict to 10 digits
        />
      </View>

      {/* Password */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Role Selection */}
      <Text style={styles.label}>Select Role:</Text>
      <View style={styles.roleRow}>
        <TouchableOpacity onPress={() => setRole("user")}>
          <Text style={[styles.roleText, role === "user" && styles.selected]}>User</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRole("guider")}>
          <Text style={[styles.roleText, role === "guider" && styles.selected]}>Guider</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRole("photographer")}>
          <Text style={[styles.roleText, role === "photographer" && styles.selected]}>Photographer</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 5 },
  phoneRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  countryCode: { flex: 1, marginRight: 5 },
  phoneInput: { flex: 3 },
  label: { fontSize: 16, marginBottom: 5 },
  roleRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  roleText: { fontSize: 16, padding: 5 },
  selected: { color: "blue", fontWeight: "bold" },
  button: { backgroundColor: "blue", padding: 15, borderRadius: 5 },
  buttonText: { color: "#fff", textAlign: "center", fontSize: 16 },
});
