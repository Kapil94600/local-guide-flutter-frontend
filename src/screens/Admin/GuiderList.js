import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";
import api from "../../api/apiClient";
import { API } from "../../api/endpoints";

export default function GuiderList() {
  const [guiders, setGuiders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGuiders();
  }, []);

  const fetchGuiders = async () => {
    try {
      setLoading(true);
      const res = await api.post(API.GET_GUIDERS_ALL);
      setGuiders(res.data?.data || []);
    } catch (e) {
      console.log("Guider list error:", e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (guider) => {
    try {
      await api.post(API.CHANGE_GUIDER_ACTIVE_STATUS, {
        guiderId: guider.id,
        active: !guider.active,
      });
      fetchGuiders();
    } catch (e) {
      console.log("Change status error:", e.message);
    }
  };

  const deleteGuider = (id) => {
    Alert.alert(
      "Delete Guider",
      "Are you sure you want to delete this guider?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await api.post(API.DELETE_GUIDER, { guiderId: id });
            fetchGuiders();
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{item.name || "No Name"}</Text>
        <Text style={styles.phone}>{item.phone || "No Phone"}</Text>
      </View>

      <View style={styles.actions}>
        <Switch
          value={item.active}
          onValueChange={() => toggleStatus(item)}
        />

        <TouchableOpacity onPress={() => deleteGuider(item.id)}>
          <Text style={styles.delete}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={guiders}
      keyExtractor={(item) => item.id?.toString()}
      contentContainerStyle={styles.list}
      refreshing={loading}
      onRefresh={fetchGuiders}
      renderItem={renderItem}
      ListEmptyComponent={
        <Text style={styles.empty}>No guiders found</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  phone: {
    marginTop: 4,
    color: "#6B7280",
  },
  actions: {
    alignItems: "center",
  },
  delete: {
    marginTop: 6,
    color: "#DC2626",
    fontSize: 12,
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#6B7280",
  },
});
