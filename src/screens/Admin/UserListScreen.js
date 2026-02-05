import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import api from "../../api/apiClient";

const BASE_URL = "http://31.97.227.108:8081/"; // 🔥 backend base url

export default function UserListScreen() {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  // 📥 GET USERS
  const fetchUsers = async () => {
    try {
      const res = await api.post("/user/get_user_list");
      if (res.data.status) {
        setUsers(res.data.data || []);
      }
    } catch (e) {
      console.log("USER LIST ERROR 👉", e.response?.data || e.message);
    }
  };

  // 🧠 PROFILE IMAGE URL FIX
  const getProfileImage = (user) => {
    if (!user.profilePicture) {
      return "https://via.placeholder.com/80";
    }
    if (user.profilePicture.startsWith("http")) {
      return user.profilePicture;
    }
    // cache busting with timestamp
    return `${BASE_URL}${user.profilePicture}?t=${Date.now()}`;
  };

  // 🖼️ PICK IMAGE + UPLOAD
  const pickImageAndUpload = async (userId) => {
  try {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Gallery access needed");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],   // ✅ ONLY THIS
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    setUploadingId(userId);

    const photo = result.assets[0];

    const formData = new FormData();
    formData.append("id", String(userId));

    // ❗ BACKEND EXPECTS `file`
    formData.append("file", {
      uri: photo.uri,
      name: "profile.jpg",
      type: "image/jpeg",
    });

    const res = await api.post(
      "/user/update_profile_picture",
      formData
      // ❌ headers mat bhejo
    );

    console.log("PHOTO UPDATE RESPONSE 👉", res.data);

    if (res.data.status) {
      fetchUsers(); // refresh list
    } else {
      Alert.alert("Upload failed", res.data.message);
    }

  } catch (e) {
    console.log("PHOTO UPLOAD ERROR 👉", e.response?.data || e.message);
    Alert.alert("Error", "Photo upload failed");
  } finally {
    setUploadingId(null);
  }
};

  // ✏️ OPEN EDIT MODAL
  const openEdit = (user) => {
    setEditUser(user);
    setName(user.name || "");
    setPhone(user.phone || "");
  };

  // 💾 UPDATE USER
  const updateUser = async () => {
    try {
      await api.post("/user/update_profile", {
        id: editUser.id,
        name,
        phone,
      });
      setEditUser(null);
      fetchUsers();
    } catch {
      Alert.alert("Error", "User update failed");
    }
  };

  // 🗑️ DELETE USER
  const deleteUser = (id) => {
    Alert.alert("Confirm", "Delete this user?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.post("/user/delete", { id });
            fetchUsers();
          } catch {
            Alert.alert("Error", "Delete failed");
          }
        },
      },
    ]);
  };

  // 📄 USER CARD
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => pickImageAndUpload(item.id)}>
        <Image
          source={{ uri: getProfileImage(item) }}
          style={styles.avatar}
        />
        {uploadingId === item.id && (
          <Text style={styles.uploading}>Uploading...</Text>
        )}
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => openEdit(item)}
        >
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => deleteUser(item.id)}
        >
          <Text style={styles.btnText}>Del</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users</Text>

      <FlatList
        data={users}
        keyExtractor={(i) => i.id.toString()}
        renderItem={renderItem}
      />

      {/* ✏️ EDIT MODAL */}
      <Modal visible={!!editUser} transparent animationType="slide">
        <View style={styles.modalWrap}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Edit User</Text>

            <TextInput
              placeholder="Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Phone"
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              keyboardType="phone-pad"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={updateUser}>
              <Text style={styles.btnText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setEditUser(null)}
            >
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f5f5" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },

  uploading: {
    fontSize: 10,
    color: "#2196F3",
    textAlign: "center",
  },

  name: { fontSize: 16, fontWeight: "bold" },
  phone: { color: "#666" },

  actions: { marginLeft: 10 },
  editBtn: {
    backgroundColor: "#2196F3",
    padding: 6,
    borderRadius: 6,
    marginBottom: 5,
  },
  deleteBtn: {
    backgroundColor: "#F44336",
    padding: 6,
    borderRadius: 6,
  },
  btnText: { color: "#fff", fontWeight: "bold", textAlign: "center" },

  modalWrap: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modal: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },

  saveBtn: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  cancelBtn: {
    backgroundColor: "#777",
    padding: 10,
    borderRadius: 8,
  },
});
