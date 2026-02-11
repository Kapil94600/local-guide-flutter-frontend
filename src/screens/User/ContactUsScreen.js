import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Linking }from "react-native";

export default function ContactUsScreen({ navigation }) {
  const PHONE_NUMBER = "+919876543210"; // 🔴 apna number
  const EMAIL = "support@localguider.com"; // 🔴 apni email

  /* 📞 CALL */
  const handleCall = async () => {
    const url = `tel:${PHONE_NUMBER}`;
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert("Error", "Calling not supported on this device");
    }
  };

  /* 📧 EMAIL */
  const handleEmail = async () => {
    const url = `mailto:${EMAIL}`;
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert("Error", "Email app not available");
    }
  };

  return (
    <View style={styles.container}>
      {/* 🔙 HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 📞 PHONE */}
      <TouchableOpacity style={styles.card} onPress={handleCall}>
        <Ionicons name="call-outline" size={28} color="#446f94e3" />
        <View style={styles.textBox}>
          <Text style={styles.label}>Call Us</Text>
          <Text style={styles.value}>{PHONE_NUMBER}</Text>
        </View>
      </TouchableOpacity>

      {/* 📧 EMAIL */}
      <TouchableOpacity style={styles.card} onPress={handleEmail}>
        <Ionicons name="mail-outline" size={28} color="#446f94e3"/>
        <View style={styles.textBox}>
          <Text style={styles.label}>Email Us</Text>
          <Text style={styles.value}>{EMAIL}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

/* 🎨 STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  header: {
    backgroundColor: "#446f94e3",
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
  },

  textBox: {
    marginLeft: 16,
  },

  label: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },

  value: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
});
