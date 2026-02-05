import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import api from "../api/apiClient";

export default function AdminDashboard({ navigation }) {
  // 🔢 COUNTS
  const [counts, setCounts] = useState({
    users: 0,
    photographers: 0,
    guiders: 0,
    places: 0,
    transactions: 0,
    requests: 0,
  });

  // 💰 STATS
  const [today, setToday] = useState({ txns: 0, revenue: 0 });
  const [month, setMonth] = useState({ txns: 0, revenue: 0 });

  useEffect(() => {
    loadDashboard();
    const i = setInterval(loadDashboard, 5000);
    return () => clearInterval(i);
  }, []);

  const loadDashboard = async () => {
    try {
      const [u, p, g, t, pr] = await Promise.all([
        api.post("/user/get_user_list"),
        api.post("/photographers/get_all"),
        api.post("/guider/get_all"),
        api.post("/transaction/get", {
          admin: true,
          page: 1,
          perPage: 1000,
        }),
        api.post("/photographers/all_requests"),
      ]);

      // BASIC COUNTS
      setCounts({
        users: u.data?.data?.length || 0,
        photographers: p.data?.data?.length || 0,
        guiders: g.data?.data?.length || 0,
        places: 0,
        transactions: t.data?.data?.length || 0,
        requests: pr.data?.data?.length || 0,
      });

      // TODAY / MONTH COMBINED
      const txns = t.data?.data || [];
      const now = new Date();

      let todayTxn = 0,
        todayRev = 0,
        monthTxn = 0,
        monthRev = 0;

      txns.forEach((tx) => {
        const d = new Date(tx.createdAt);
        const amt = Number(tx.amount || 0);

        if (d.toDateString() === now.toDateString()) {
          todayTxn++;
          todayRev += amt;
        }

        if (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        ) {
          monthTxn++;
          monthRev += amt;
        }
      });

      setToday({ txns: todayTxn, revenue: todayRev });
      setMonth({ txns: monthTxn, revenue: monthRev });
    } catch (e) {
      console.log("Dashboard error:", e.message);
    }
  };

  // 🧩 FINAL CARD LIST
  const cards = [
    // CORE
    { label: "Users", value: counts.users, icon: "account-group", route: "UserList", bg: "#c7d2f6" },
    { label: "Photographers", value: counts.photographers, icon: "camera", route: "PhotographerList", bg: "#d2b7f0" },
    { label: "Guiders", value: counts.guiders, icon: "map-marker-account", route: "GuiderList", bg: "#ccfcfe" },
    { label: "Places", value: counts.places, icon: "map-marker-multiple", route: "PlaceList", bg: "#fae0c1" },

    // BUSINESS (COMBINED)
    {
      label: "Today",
      sub: `${today.txns} Txns • ₹${today.revenue}`,
      icon: "calendar-today",
      route: "TransactionList",
      bg: "#b4f5d7",
    },
    {
      label: "This Month",
      sub: `${month.txns} Txns • ₹${month.revenue}`,
      icon: "calendar-month",
      route: "TransactionList",
      bg: "#c2cef7",
    },

    // MANAGEMENT
    { label: "Transactions", value: counts.transactions, icon: "credit-card", route: "TransactionList", bg: "#F0FDF4" },
    { label: "Requests", value: counts.requests, icon: "account-clock", route: "PhotographerRequests", bg: "#FEFCE8" },
    { label: "Notifications", value: "", icon: "bell-outline", route: "NotificationList", bg: "#ECFEFF" },
    { label: "Settings", value: "", icon: "cog-outline", route: "AdminSettings", bg: "#FDF2F8" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#9F96E1" barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.admin}>Admin Dashboard</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* CARDS */}
      <FlatList
        data={cards}
        keyExtractor={(i) => i.label}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: item.bg }]}
            onPress={() => item.route && navigation.navigate(item.route)}
            activeOpacity={0.85}
          >
            <Icon name={item.icon} size={26} color="#111827" />
            <Text style={styles.cardLabel}>{item.label}</Text>

            {item.value !== undefined && item.value !== "" && (
              <Text style={styles.cardValue}>{item.value}</Text>
            )}

            {item.sub && <Text style={styles.cardSub}>{item.sub}</Text>}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FB" },

  header: {
    backgroundColor: "rgb(159,150,225)",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },

  admin: { fontSize: 20, fontWeight: "700", color: "#1F2937" },

  grid: { padding: 12, paddingBottom: 30 },

  card: {
    flex: 1,
    margin: 12,
    borderRadius: 18,
    paddingVertical: 58,
    paddingHorizontal: 12,
    alignItems: "center",
    elevation: 4,
  },

  cardLabel: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },

  cardValue: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
  },

  cardSub: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
});
