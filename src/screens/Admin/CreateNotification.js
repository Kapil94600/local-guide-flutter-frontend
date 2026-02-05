import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import api from "../../api/apiClient";
import { API } from "../../api/endpoints";

export default function CreateNotification({ navigation }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!title || !message) {
      Alert.alert("Error", "Title and message required");
      return;
    }

    try {
      setLoading(true);
      await api.post(API.CREATE_NOTIFICATION, {
        title,
        message,
      });
      navigation.goBack();
    } catch (e) {
      console.log("Create notification error:", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Title"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        placeholder="Message"
        style={[styles.input, styles.textarea]}
        value={message}
        onChangeText={setMessage}
        multiline
      />

      <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
        <Text style={styles.btnText}>
          {loading ? "Sending..." : "Send Notification"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  textarea: { height: 120, textAlignVertical: "top" },
  btn: {
    backgroundColor: "#3F51B5",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { color: "#fff", fontWeight: "600" },
});
