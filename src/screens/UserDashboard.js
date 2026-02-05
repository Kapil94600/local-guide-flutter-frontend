import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import UserMenuOverlay from "../components/UserMenuOverlay";
import { AuthContext } from "../context/AuthContext";
import { LocationContext } from "../context/LocationContext";
import api, { API } from "../api/api";

export default function UserDashboard({ navigation }) {
  const { user, refreshUser } = useContext(AuthContext);
  const { location, loading } = useContext(LocationContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const [homeData, setHomeData] = useState({
    places: [],
    guiders: [],
    photographers: [],
  });
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  useEffect(() => {
    refreshUser && refreshUser();
  }, []);

  useEffect(() => {
    if (!location?.id) return;
    fetchHomeData(location.id);
  }, [location]);

  const fetchHomeData = async (placeId) => {
    try {
      setLoadingPlaces(true);
      console.log("Fetching places for locationId:", placeId);

      // ✅ Places POST request
      const placesRes = await api.post(API.GET_PLACES, { locationId: placeId });
      console.log("Places Response:", placesRes.data);

      const guidersRes = await api.post("/guider/get_by_place", { placeId });
      const photographersRes = await api.post("/photographers/get_by_place", { placeId });

      setHomeData({
        places: placesRes.data?.data || [],
        guiders: guidersRes.data?.data || [],
        photographers: photographersRes.data?.data || [],
      });

      setLoadingPlaces(false);
    } catch (err) {
      console.error("Home API Error:", err.response?.data || err.message);
      setLoadingPlaces(false);
    }
  };

  const userName = user?.name?.trim()
    ? user.name
    : user?.username || user?.email || "User";

  const locationText = loading
    ? "Detecting location..."
    : location?.city
    ? `${location.city}${location.state ? ", " + location.state : ""}`
    : "Select location";

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FB" }}>
      {/* MENU OVERLAY */}
      {menuOpen && (
        <UserMenuOverlay
          onClose={() => setMenuOpen(false)}
          onNavigate={(screen) => {
            setMenuOpen(false);
            if (screen !== "Logout") navigation.navigate(screen);
          }}
        />
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMenuOpen(true)}>
            <Ionicons name="menu" size={26} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ alignItems: "center" }}
            onPress={() => navigation.navigate("LocationSearch")}
          >
            <Text style={styles.greeting}>Hi, {userName}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#fff" />
              <Text style={styles.locationText} numberOfLines={1}>
                {locationText}
              </Text>
              <Ionicons name="chevron-down" size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.headerIcons}>
            <Ionicons name="person-outline" size={22} color="#fff" />
            <Ionicons name="notifications-outline" size={22} color="#fff" />
          </View>
        </View>

        {/* HERO CARD */}
        <View style={styles.heroWrapper}>
          <View style={styles.heroCard}>
            <View style={styles.heroOverlay} />
            <View style={styles.heroTextWrapper}>
              <Text style={styles.heroText}>Discover beautiful places ✨</Text>
              <Text style={styles.heroSubText}>
                Explore top destinations, guiders, and photographers near you!
              </Text>
            </View>

            {/* SEARCH BOX */}
            <View style={styles.heroSearchBox}>
              <Ionicons name="search" size={20} color="#6B7280" />
              <TextInput
                placeholder="Search places, guiders, photographers"
                placeholderTextColor="#9CA3AF"
                style={styles.searchInput}
              />
            </View>
          </View>
        </View>

        {/* POPULAR PLACES */}
        <Section title="Popular Places">
          {loadingPlaces ? (
            <Text style={{ marginLeft: 16 }}>Loading...</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {homeData.places.map((place) => (
                <PlaceCard key={place.id} item={place} navigation={navigation} />
              ))}
            </ScrollView>
          )}
        </Section>

        {/* POPULAR GUIDERS */}
        <Section title="Popular Guiders">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {homeData.guiders.map((guider) => (
              <PersonCard
                key={guider.id}
                item={guider}
                role="Guider"
                navigation={navigation}
              />
            ))}
          </ScrollView>
        </Section>

        {/* POPULAR PHOTOGRAPHERS */}
        <Section title="Popular Photographers">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {homeData.photographers.map((photographer) => (
              <PersonCard
                key={photographer.id}
                item={photographer}
                role="Photographer"
                navigation={navigation}
              />
            ))}
          </ScrollView>
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* ================= COMPONENTS ================= */
function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function PlaceCard({ item, navigation }) {
  return (
    <TouchableOpacity
      style={styles.placeCard}
      onPress={() => navigation.navigate("PlaceDetails", { placeId: item.id })}
    >
      <Text style={styles.placeTitle}>{item.name}</Text>
      <Text style={styles.placeRating}>⭐ {item.rating}</Text>
    </TouchableOpacity>
  );
}

function PersonCard({ item, role, navigation }) {
  return (
    <TouchableOpacity
      style={styles.personCard}
      onPress={() =>
        navigation.navigate("PersonDetails", { id: item.id, role })
      }
    >
      <Text style={styles.personName}>{item.name}</Text>
      <Text style={styles.personMeta}>
        ⭐ {item.rating} · {role}
      </Text>
    </TouchableOpacity>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  header: {
    backgroundColor: "#3a0250e3",
    paddingTop: 46,
    paddingHorizontal: 16,
    paddingBottom: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  greeting: { color: "#fff", fontSize: 16, fontWeight: "700" },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  locationText: { color: "#fff", fontSize: 12, marginHorizontal: 4, maxWidth: 140 },
  headerIcons: { flexDirection: "row", gap: 14 },

  heroWrapper: { marginTop: 16, alignItems: "center", width: "100%", marginBottom: 32 },
  heroCard: { width: "90%", height: 200, borderRadius: 24, backgroundColor: "#7a528a", overflow: "hidden" },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.25)", borderRadius: 24 },
  heroTextWrapper: { position: "absolute", top: 24, left: 24, right: 24 },
  heroText: { fontSize: 22, fontWeight: "800", color: "#fff" },
  heroSubText: { fontSize: 14, color: "#F3F4F6", marginTop: 4 },

  heroSearchBox: {
    position: "absolute",
    bottom: 25,
    left: "5%",
    width: "90%",
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 28,
    alignItems: "center",
    elevation: 6,
  },
  searchInput: { marginLeft: 10, flex: 1, fontSize: 14, color: "#111827" },

  section: { marginTop: 40, marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginLeft: 16, marginBottom: 12, color: "#222" },

  placeCard: {
    width: 200,
    height: 100,
    borderRadius: 18,
    marginLeft: 16,
    backgroundColor: "#8c5298",
    justifyContent: "center",
    paddingLeft: 12,
  },
  placeTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  placeRating: { color: "#ffd700", fontWeight: "600", marginTop: 4 },

  personCard: { width: 140, backgroundColor: "#fff", borderRadius: 16, marginLeft: 16, padding: 12, alignItems: "center", elevation: 3 },
  personName: { fontWeight: "700", fontSize: 14, color: "#222" },
  personMeta: { fontSize: 12, color: "#777", marginTop: 4 },
});
