import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";

export default function UserEditProfileScreen({ navigation }) {
  const { user, updateProfile } = useContext(AuthContext);

  /* 🔹 FORM STATE (ALL USER FIELDS) */
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(false);

  /* ✅ PREFILL DATA */
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setEmail(user.email || "");
      setUsername(user.username || "");
      setCountryCode(user.countryCode || "+91");
      setAddress(user.address || "");
      setGender(user.gender || "");
      setDob(user.dob || "");
      setLatitude(user.latitude?.toString() || "");
      setLongitude(user.longitude?.toString() || "");
    }
  }, [user]);

  /* ✅ UPDATE HANDLER */
  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Name is required");
      return;
    }

    try {
      setLoading(true);

      await updateProfile({
        userId: user.id,              // 🔥 REQUIRED
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        username: username.trim(),
        countryCode,
        address: address.trim(),
        gender,
        dob,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
      });

      Alert.alert("Success", "Profile updated successfully");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", "Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* 🔙 HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 🧾 FORM */}
      <View style={styles.card}>
        <Input label="Full Name" value={name} onChangeText={setName} />
        <Input label="Phone" value={phone} onChangeText={setPhone} keyboard="phone-pad" />
        <Input label="Email" value={email} onChangeText={setEmail} keyboard="email-address" />
        <Input label="Username" value={username} onChangeText={setUsername} />
        <Input label="Country Code" value={countryCode} onChangeText={setCountryCode} />
        <Input label="Address" value={address} onChangeText={setAddress} />
        <Input label="Gender" value={gender} onChangeText={setGender} />
        <Input label="Date of Birth" value={dob} onChangeText={setDob} />
        <Input label="Latitude" value={latitude} onChangeText={setLatitude} />
        <Input label="Longitude" value={longitude} onChangeText={setLongitude} />

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={handleUpdate}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading ? "Updating..." : "Update Profile"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* 🔹 REUSABLE INPUT */
const Input = ({ label, value, onChangeText, keyboard }) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      style={styles.input}
      keyboardType={keyboard || "default"}
    />
  </>
);

/* 🎨 STYLES */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  header: {
    backgroundColor: "#446f94e3",
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },

  card: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 4,
  },

  label: { fontWeight: "600", marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },

  btn: {
    backgroundColor: "#3a0250e3",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
