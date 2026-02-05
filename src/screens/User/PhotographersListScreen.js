import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import api from "../../api/api";
import { API } from "../../api/apis";
import { LocationContext } from "../../context/LocationContext";

export default function PhotographersListScreen() {
  const { location } = useContext(LocationContext);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      fetchPhotographers();
    }
  }, [location]);

  const fetchPhotographers = async () => {
    try {
      setLoading(true);

      const res = await api.get(API.GET_PHOTOGRAPHERS_BY_PLACE_ID, {
        params: {
          lat: location.latitude,
          lng: location.longitude,
        },
      });

      setList(res.data?.data || []);
    } catch (e) {
      console.log("PHOTO LIST ERROR 👉", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={list}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>
          <Text>{item.placeName}</Text>
          <Text style={styles.distance}>
            {item.distance?.toFixed(2)} km away
          </Text>
        </View>
      )}
      ListEmptyComponent={
        <Text style={{ textAlign: "center", marginTop: 40 }}>
          No photographers found nearby
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  name: { fontSize: 16, fontWeight: "700" },
  distance: { marginTop: 4, color: "#2563EB" },
});
