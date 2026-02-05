import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import api from "../../api/apiClient";
import { API } from "../../api/endpoints";

export default function NotificationList({ navigation }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // adminId agar backend maange to yahan pass kar sakte ho
      const res = await api.post(API.GET_NOTIFICATIONS, { admin: true });
      setList(res.data?.data || []);
    } catch (e) {
      console.log("Notification list error:", e.message);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await api.post(API.MARK_AS_READ_NOTIFICATION, { notificationId: id });
      fetchNotifications();
    } catch (e) {
      console.log("Mark read error:", e.message);
    }
  };

  const deleteNotification = (id) => {
    Alert.alert("Delete", "Delete this notification?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await api.post(API.DELETE_NOTIFICATION, { notificationId: id });
          fetchNotifications();
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.card,
        !item.read && { borderLeftColor: "#3F51B5", borderLeftWidth: 4 },
      ]}
      onPress={() => markRead(item.id)}
      onLongPress={() => deleteNotification(item.id)}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
      </View>

      {!item.read && <Icon name="circle" size={10} color="#3F51B5" />}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={list}
        keyExtractor={(i) => i.id?.toString()}
        refreshing={loading}
        onRefresh={fetchNotifications}
        contentContainerStyle={{ padding: 16 }}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No notifications</Text>
        }
      />

      {/* ➕ FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreateNotification")}
      >
        <Icon name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  message: {
    marginTop: 4,
    color: "#6B7280",
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#6B7280",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3F51B5",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});
