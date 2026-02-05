import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import api from "../../api/apiClient";
import { API } from "../../api/endpoints";

export default function PlaceList({ navigation }) {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const res = await api.post(API.GET_PLACES);
      setPlaces(res.data?.data || []);
    } catch (e) {
      console.log("Place list error:", e.message);
    }
  };

  const deletePlace = (id) => {
    Alert.alert("Delete Place", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await api.post(API.DELETE_PLACE, { placeId: id });
          fetchPlaces();
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.city}>{item.city || ""}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("PlaceGallery", { placeId: item.id })
          }
        >
          <Text style={styles.link}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => deletePlace(item.id)}>
          <Text style={styles.delete}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={places}
      keyExtractor={(i) => i.id.toString()}
      contentContainerStyle={{ padding: 16 }}
      renderItem={renderItem}
      ListEmptyComponent={
        <Text style={styles.empty}>No places found</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 3,
  },
  name: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
  city: { color: "#6B7280", marginTop: 4 },
  actions: { alignItems: "flex-end" },
  link: { color: "#3F51B5", marginBottom: 8 },
  delete: { color: "#DC2626" },
  empty: { textAlign: "center", marginTop: 40, color: "#6B7280" },
});
