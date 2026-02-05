import React, { useState, useContext } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { searchPlaces } from "../../api/map";
import { LocationContext } from "../../context/LocationContext";

export default function LocationSearchScreen({ navigation }) {
  const { setLocation } = useContext(LocationContext);
  const [list, setList] = useState([]);

  const onSearch = async (text) => {
    if (text.length < 2) return setList([]);
    const res = await searchPlaces(text);
    setList(res);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f4f6ff" }}>
      {/* Curved Header */}
   <LinearGradient
  colors={["#6a11cb", "#2575fc"]}
  style={styles.header}
>
  {/* Top Row: Back + Title */}
  <View style={styles.headerRow}>
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={styles.backBtn}
      activeOpacity={0.7}
    >
      <Ionicons name="chevron-back" size={24} color="#fff" />
    </TouchableOpacity>

    <Text style={styles.headerTitle}>Choose Location</Text>

    {/* Empty view for center balance */}
    <View style={{ width: 38 }} />
  </View>

  {/* Subtitle */}
  <Text style={styles.headerSub}>
    Search your city to continue
  </Text>

  {/* Search Box */}
  <View style={styles.searchBox}>
    <Ionicons name="search" size={20} color="#666" />
    <TextInput
      autoFocus
      placeholder="Search city..."
      placeholderTextColor="#999"
      onChangeText={onSearch}
      style={styles.input}
    />
  </View>
</LinearGradient>

      {/* Soft Body */}
      <View style={styles.body}>
        <FlatList
          data={list}
          keyExtractor={(i) => i.place_id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                setLocation({
                  latitude: parseFloat(item.lat),
                  longitude: parseFloat(item.lon),
                  city: item.display_name,
                  source: "MANUAL",
                });
                navigation.goBack();
              }}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="location" size={18} color="#2575fc" />
              </View>
              <Text style={styles.cardText} numberOfLines={2}>
                {item.display_name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
 header: {
  height: 200,              // ✅ FIXED HEADER HEIGHT
  paddingTop: 50,
  paddingHorizontal: 20,
  borderBottomLeftRadius: 32,
  borderBottomRightRadius: 32,
  justifyContent: "flex-start",
},

headerRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

headerTitle: {
  fontSize: 24,
  fontWeight: "800",
  color: "#fff",
},

headerSub: {
  marginTop: 6,
  marginBottom: 18,
  fontSize: 13,
  color: "rgba(255,255,255,0.85)",
  textAlign: "center",
},
backBtn: {
  width: 38,
  height: 38,
  borderRadius: 19,
  backgroundColor: "rgba(255,255,255,0.25)",
  justifyContent: "center",
  alignItems: "center",
},

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 8,
    marginTop:25,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#000",
  },
body: {
  flex: 1,
  marginTop: 30,        // ✅ HEADER KE BAAD GAP
  backgroundColor: "#f4f6ff",
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,
  padding: 16,
},


  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    elevation: 4,
    
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#eef3ff",
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: {
    marginLeft: 14,
    fontSize: 15,
    color: "#222",
    fontWeight: "500",
  },
});
