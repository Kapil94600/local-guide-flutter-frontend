import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import api from "../api/apiClient";
import { AuthContext } from "../context/AuthContext";

export default function GuiderDashboard() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.post("/appointment/get_all", {
          guiderId: user?.gId, // ✅ backend expects guiderId
        });

        if (res.data.status) {
          setAppointments(res.data.data);
        } else {
          console.error("Failed:", res.data.message);
        }
      } catch (err) {
        console.error("Error fetching appointments:", err.response?.data || err.message);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧭 Guider Dashboard</Text>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>Service: {item.serviceName}</Text>
            <Text style={styles.text}>Date: {item.date}</Text>
            <Text style={styles.text}>Customer: {item.customerName}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.text}>No appointments found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  card: { backgroundColor: "#fff", padding: 15, marginBottom: 10, borderRadius: 8, elevation: 2 },
  text: { fontSize: 16, marginBottom: 5 },
});
