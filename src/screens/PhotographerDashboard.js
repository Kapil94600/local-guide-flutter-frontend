import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import ProfileCard from "../components/ProfileCard";
import StatsCard from "../components/StatsCard";
import ServiceCard from "../components/ServiceCard";

export default function PhotographerDashboard() {
  const [profile, setProfile] = useState({
    firmName: "Kapil Photography",
    rating: 4.6,
    approvalStatus: "APPROVED",
    active: true,
    image: "https://i.pravatar.cc/150",
  });

  const services = [
    { id: 1, title: "Wedding Shoot", description: "Full day shoot", price: 15000 },
    { id: 2, title: "Pre Wedding", description: "Outdoor shoot", price: 8000 },
  ];

  return (
    <ScrollView style={styles.container}>
      <ProfileCard
        profile={profile}
        onToggle={() =>
          setProfile({ ...profile, active: !profile.active })
        }
      />

      <View style={styles.row}>
        <StatsCard title="Today" value="2500" />
        <StatsCard title="Month" value="42000" />
        <StatsCard title="Total" value="1,85,000" />
      </View>

      <Text style={styles.heading}>Services</Text>
      {services.map((item) => (
        <ServiceCard key={item.id} service={item} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: "#F9FAFB" },
  row: { flexDirection: "row", marginBottom: 20 },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
