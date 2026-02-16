import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import UserMenuOverlay from "../components/UserMenuOverlay";
import { AuthContext } from "../context/AuthContext";
import { LocationContext } from "../context/LocationContext";
import api from "../api/apiClient";
import { API } from "../api/endpoints";

const BASE_URL = "http://31.97.227.108:8081";

export default function UserDashboard({ navigation }) {
  const { user, refreshUser } = useContext(AuthContext);
  const { location, loading: locationLoading, refreshLocation } = useContext(LocationContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState({
    places: false,
    guiders: false,
    photographers: false,
    topPlaces: false,
    topGuiders: false,
    topPhotographers: false,
  });

  // Modal States
  const [placeModal, setPlaceModal] = useState(false);
  const [guiderModal, setGuiderModal] = useState(false);
  const [photographerModal, setPhotographerModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedGuider, setSelectedGuider] = useState(null);
  const [selectedPhotographer, setSelectedPhotographer] = useState(null);

  const [data, setData] = useState({
    places: [],
    guiders: [],
    photographers: [],
    topPlaces: [],
    topGuiders: [],
    topPhotographers: [],
  });

  // ✅ Load data when component mounts
  useEffect(() => {
    refreshUser && refreshUser();

    // Get current location immediately
    if (refreshLocation) {
      refreshLocation();
    }
  }, []);

  // ✅ Fetch all data when location is available
  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      fetchAllData();
    } else {
      // If no location, try to get it
      if (refreshLocation) {
        refreshLocation();
      }
    }
  }, [location]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchTopPlaces(),
      fetchTopGuiders(),
      fetchTopPhotographers(),
      fetchPlaces(),
      fetchGuiders(),
      fetchPhotographers(),
    ]);
  };

  // ✅ GET_PLACES - POST request with pagination
  const fetchPlaces = async (page = 1) => {
    try {
      setLoading(prev => ({ ...prev, places: true }));
      const response = await api.post(API.GET_PLACES, {
        latitude: location?.latitude,
        longitude: location?.longitude,
        page,
        perPage: 10,
        searchText: searchQuery,
      });

      if (response.data?.status) {
        setData(prev => ({
          ...prev,
          places: page === 1 ? response.data.data : [...prev.places, ...response.data.data],
        }));
      }
    } catch (error) {
      console.error("Error fetching places:", error);
    } finally {
      setLoading(prev => ({ ...prev, places: false }));
    }
  };

  // ✅ GET_GUIDERS_ALL - POST request with filters
  const fetchGuiders = async (page = 1) => {
    try {
      setLoading(prev => ({ ...prev, guiders: true }));
      const response = await api.post(API.GET_GUIDERS_ALL, {
        latitude: location?.latitude,
        longitude: location?.longitude,
        page,
        perPage: 10,
        searchText: searchQuery,
        sortBy: "rating",
        status: "APPROVED",
      });

      if (response.data?.status) {
        setData(prev => ({
          ...prev,
          guiders: page === 1 ? response.data.data : [...prev.guiders, ...response.data.data],
        }));
      }
    } catch (error) {
      console.error("Error fetching guiders:", error);
    } finally {
      setLoading(prev => ({ ...prev, guiders: false }));
    }
  };

  // ✅ GET_PHOTOGRAPHERS_ALL - POST request with filters
  const fetchPhotographers = async (page = 1) => {
    try {
      setLoading(prev => ({ ...prev, photographers: true }));
      const response = await api.post(API.GET_PHOTOGRAPHERS_ALL, {
        latitude: location?.latitude,
        longitude: location?.longitude,
        page,
        perPage: 10,
        searchText: searchQuery,
        sortBy: "rating",
        status: "APPROVED",
      });

      if (response.data?.status) {
        setData(prev => ({
          ...prev,
          photographers: page === 1 ? response.data.data : [...prev.photographers, ...response.data.data],
        }));
      }
    } catch (error) {
      console.error("Error fetching photographers:", error);
    } finally {
      setLoading(prev => ({ ...prev, photographers: false }));
    }
  };

  // ✅ GET_TOP_PLACES - Use GET_PLACES with filters
  const fetchTopPlaces = async () => {
    try {
      setLoading(prev => ({ ...prev, topPlaces: true }));
      const response = await api.post(API.GET_PLACES, {
        latitude: location?.latitude,
        longitude: location?.longitude,
        page: 1,
        perPage: 5,
        sortBy: "rating",
        minRating: 4.0,
      });

      if (response.data?.status) {
        setData(prev => ({ ...prev, topPlaces: response.data.data || [] }));
      }
    } catch (error) {
      console.error("Error fetching top places:", error);
    } finally {
      setLoading(prev => ({ ...prev, topPlaces: false }));
    }
  };

  // ✅ GET_TOP_GUIDERS - Use GET_GUIDERS_ALL with filters
  const fetchTopGuiders = async () => {
    try {
      setLoading(prev => ({ ...prev, topGuiders: true }));
      const response = await api.post(API.GET_GUIDERS_ALL, {
        latitude: location?.latitude,
        longitude: location?.longitude,
        page: 1,
        perPage: 5,
        sortBy: "rating",
        minRating: 4.0,
        status: "APPROVED",
      });

      if (response.data?.status) {
        setData(prev => ({ ...prev, topGuiders: response.data.data || [] }));
      }
    } catch (error) {
      console.error("Error fetching top guiders:", error);
    } finally {
      setLoading(prev => ({ ...prev, topGuiders: false }));
    }
  };

  // ✅ GET_TOP_PHOTOGRAPHERS - Use GET_PHOTOGRAPHERS_ALL with filters
  const fetchTopPhotographers = async () => {
    try {
      setLoading(prev => ({ ...prev, topPhotographers: true }));
      const response = await api.post(API.GET_PHOTOGRAPHERS_ALL, {
        latitude: location?.latitude,
        longitude: location?.longitude,
        page: 1,
        perPage: 5,
        sortBy: "rating",
        minRating: 4.0,
        status: "APPROVED",
      });

      if (response.data?.status) {
        setData(prev => ({ ...prev, topPhotographers: response.data.data || [] }));
      }
    } catch (error) {
      console.error("Error fetching top photographers:", error);
    } finally {
      setLoading(prev => ({ ...prev, topPhotographers: false }));
    }
  };

  const handleSearch = () => {
    fetchPlaces(1);
    fetchGuiders(1);
    fetchPhotographers(1);
  };

  // ✅ Pull to Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    if (refreshLocation) {
      await refreshLocation();
    }
    await fetchAllData();
    setRefreshing(false);
  };

  // ✅ Manual location selection
  const handleLocationPress = () => {
    navigation.navigate("LocationSearch", {
      onLocationSelected: (selectedLocation) => {
        if (refreshLocation) {
          refreshLocation();
        }
      }
    });
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    try {
      const filename = path.split("/").pop();
      return `${BASE_URL}/Uploads/${filename}`;
    } catch (error) {
      return null;
    }
  };

  const userName = user?.name?.trim()
    ? user.name
    : user?.username || user?.email || "User";

  const getLocationText = () => {
    if (locationLoading) return "Detecting location...";
    if (location?.city) {
      return `${location.city}${location.state ? ", " + location.state : ""}`;
    }
    if (location?.error) return "Location unavailable";
    return "Select location";
  };

  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalf = (rating || 0) % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Ionicons key={i} name="star" size={14} color="#FFD700" />);
      } else if (i === fullStars && hasHalf) {
        stars.push(<Ionicons key={i} name="star-half" size={14} color="#FFD700" />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={14} color="#FFD700" />);
      }
    }
    return <View style={{ flexDirection: 'row' }}>{stars}</View>;
  };

  // ✅ Navigate to all list screens
  const navigateToList = (type) => {
    navigation.navigate("AllList", { type });
  };

  // ✅ Place Details Modal
  const renderPlaceModal = () => (
    <Modal
      visible={placeModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setPlaceModal(false)}
    >
      <BlurView intensity={20} style={StyleSheet.absoluteFill} />
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setPlaceModal(false)}
      >
        <View style={styles.modalContent}>
          {selectedPlace && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedPlace.placeName}</Text>
                <TouchableOpacity onPress={() => setPlaceModal(false)}>
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              {selectedPlace.featuredImage ? (
                <Image
                  source={{ uri: getImageUrl(selectedPlace.featuredImage) }}
                  style={styles.modalImage}
                />
              ) : (
                <LinearGradient
                  colors={['#2c5a73', '#1e3c4f']}
                  style={styles.modalImagePlaceholder}
                >
                  <Ionicons name="image-outline" size={40} color="#fff" />
                </LinearGradient>
              )}

              <View style={styles.modalRating}>
                {renderRating(selectedPlace.rating)}
                <Text style={styles.modalRatingText}>({selectedPlace.rating?.toFixed(1) || '0.0'})</Text>
              </View>

              <View style={styles.modalLocation}>
                <Ionicons name="location-outline" size={16} color="#2c5a73" />
                <Text style={styles.modalLocationText}>
                  {selectedPlace.city}, {selectedPlace.state}
                </Text>
              </View>

              <Text style={styles.modalDescription}>
                {selectedPlace.description || "No description available"}
              </Text>

              <View style={styles.modalStats}>
                <View style={styles.modalStat}>
                  <Ionicons name="eye-outline" size={18} color="#2c5a73" />
                  <Text style={styles.modalStatValue}>{selectedPlace.views || 0}</Text>
                  <Text style={styles.modalStatLabel}>Views</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setPlaceModal(false);
                  navigation.navigate("PlaceDetails", { placeId: selectedPlace.id });
                }}
              >
                <LinearGradient
                  colors={["#2c5a73", "#1e3c4f"]}
                  style={styles.modalButtonGradient}
                >
                  <Text style={styles.modalButtonText}>View Full Details</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // ✅ Guider Details Modal
  const renderGuiderModal = () => (
    <Modal
      visible={guiderModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setGuiderModal(false)}
    >
      <BlurView intensity={20} style={StyleSheet.absoluteFill} />
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setGuiderModal(false)}
      >
        <View style={styles.modalContent}>
          {selectedGuider && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedGuider.firmName || selectedGuider.name || "Tour Guide"}
                </Text>
                <TouchableOpacity onPress={() => setGuiderModal(false)}>
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalProfileHeader}>
                {selectedGuider.featuredImage ? (
                  <Image
                    source={{ uri: getImageUrl(selectedGuider.featuredImage) }}
                    style={styles.modalProfileImage}
                  />
                ) : (
                  <View style={[styles.modalProfileImage, styles.modalImagePlaceholder]}>
                    <Text style={styles.modalProfileInitial}>
                      {selectedGuider.firmName?.charAt(0) || selectedGuider.name?.charAt(0) || 'G'}
                    </Text>
                  </View>
                )}

                <View style={styles.modalRating}>
                  {renderRating(selectedGuider.rating)}
                  <Text style={styles.modalRatingText}>({selectedGuider.rating?.toFixed(1) || '0.0'})</Text>
                </View>

                <View style={styles.modalLocation}>
                  <Ionicons name="location-outline" size={16} color="#2c5a73" />
                  <Text style={styles.modalLocationText}>
                    {selectedGuider.placeName || "Local Guide"}
                  </Text>
                </View>
              </View>

              {selectedGuider.verified && (
                <View style={styles.modalVerifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.modalVerifiedText}>Verified Guide</Text>
                </View>
              )}

              <Text style={styles.modalDescription}>
                {selectedGuider.description || "No description available"}
              </Text>

              <View style={styles.modalStats}>
                <View style={styles.modalStat}>
                  <Ionicons name="people-outline" size={18} color="#2c5a73" />
                  <Text style={styles.modalStatValue}>{selectedGuider.totalBookings || 0}</Text>
                  <Text style={styles.modalStatLabel}>Tours</Text>
                </View>
                <View style={styles.modalStat}>
                  <Ionicons name="star-outline" size={18} color="#2c5a73" />
                  <Text style={styles.modalStatValue}>{selectedGuider.reviewCount || 0}</Text>
                  <Text style={styles.modalStatLabel}>Reviews</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setGuiderModal(false);
                  navigation.navigate("GuiderDetails", { guiderId: selectedGuider.id });
                }}
              >
                <LinearGradient
                  colors={["#2c5a73", "#1e3c4f"]}
                  style={styles.modalButtonGradient}
                >
                  <Text style={styles.modalButtonText}>View Full Profile</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // ✅ Photographer Details Modal
  const renderPhotographerModal = () => (
    <Modal
      visible={photographerModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setPhotographerModal(false)}
    >
      <BlurView intensity={20} style={StyleSheet.absoluteFill} />
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setPhotographerModal(false)}
      >
        <View style={styles.modalContent}>
          {selectedPhotographer && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedPhotographer.firmName || selectedPhotographer.name || "Photographer"}
                </Text>
                <TouchableOpacity onPress={() => setPhotographerModal(false)}>
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalProfileHeader}>
                {selectedPhotographer.featuredImage ? (
                  <Image
                    source={{ uri: getImageUrl(selectedPhotographer.featuredImage) }}
                    style={styles.modalProfileImage}
                  />
                ) : (
                  <View style={[styles.modalProfileImage, styles.modalImagePlaceholder]}>
                    <Text style={styles.modalProfileInitial}>
                      {selectedPhotographer.firmName?.charAt(0) || selectedPhotographer.name?.charAt(0) || 'P'}
                    </Text>
                  </View>
                )}

                <View style={styles.modalRating}>
                  {renderRating(selectedPhotographer.rating)}
                  <Text style={styles.modalRatingText}>({selectedPhotographer.rating?.toFixed(1) || '0.0'})</Text>
                </View>

                <View style={styles.modalLocation}>
                  <Ionicons name="location-outline" size={16} color="#2c5a73" />
                  <Text style={styles.modalLocationText}>
                    {selectedPhotographer.placeName || "Local Photographer"}
                  </Text>
                </View>
              </View>

              {selectedPhotographer.verified && (
                <View style={styles.modalVerifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.modalVerifiedText}>Verified Photographer</Text>
                </View>
              )}

              <Text style={styles.modalDescription}>
                {selectedPhotographer.description || "No description available"}
              </Text>

              <View style={styles.modalStats}>
                <View style={styles.modalStat}>
                  <Ionicons name="camera-outline" size={18} color="#2c5a73" />
                  <Text style={styles.modalStatValue}>{selectedPhotographer.totalBookings || 0}</Text>
                  <Text style={styles.modalStatLabel}>Shoots</Text>
                </View>
                <View style={styles.modalStat}>
                  <Ionicons name="star-outline" size={18} color="#2c5a73" />
                  <Text style={styles.modalStatValue}>{selectedPhotographer.reviewCount || 0}</Text>
                  <Text style={styles.modalStatLabel}>Reviews</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setPhotographerModal(false);
                  navigation.navigate("PhotographerDetails", { photographerId: selectedPhotographer.id });
                }}
              >
                <LinearGradient
                  colors={["#2c5a73", "#1e3c4f"]}
                  style={styles.modalButtonGradient}
                >
                  <Text style={styles.modalButtonText}>View Full Profile</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* MENU OVERLAY */}
      <UserMenuOverlay
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={(screen) => {
          setMenuOpen(false);
          if (screen !== "Logout") navigation.navigate(screen);
        }}
      />

      {/* HEADER with Gradient */}
      <LinearGradient
        colors={['#1e3c4f', '#2c5a73', '#3b7a8f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => setMenuOpen(true)} style={styles.menuBtn}>
            <Ionicons name="menu" size={26} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.locationContainer}
            onPress={() => navigation.navigate("LocationSearch")}
          >
            <Text style={styles.greeting}>{userName}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#fff" />
              <Text style={styles.locationText} numberOfLines={1}>
                {getLocationText()}
              </Text>
              <Ionicons name="chevron-down" size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => navigation.navigate("ProfileUpdate")}>
              <Ionicons name="person-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
              <Ionicons name="notifications-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2c5a73']}
            tintColor="#2c5a73"
          />
        }
      >
        {/* HERO SEARCH SECTION */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#2c5a73', '#1e3c4f']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Discover Amazing Places</Text>
              <Text style={styles.heroSubtitle}>
                Find the best tourist spots, guides, and photographers near you
              </Text>
            </View>

            {/* Search Box */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#64748b" />
              <TextInput
                placeholder="Search places, guides, photographers..."
                placeholderTextColor="#94a3b8"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color="#94a3b8" />
                </TouchableOpacity>
              ) : null}
            </View>
          </LinearGradient>
        </View>

        {/* ===== 3 MAIN CATEGORY CARDS ===== */}
        <View style={styles.categoryContainer}>
          {/* Tour Guides Card */}
          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => navigation.navigate("GuiderListScreen")}
          >
            <LinearGradient
              colors={['#255068', '#7696a8']}
              style={styles.categoryGradient}
            >
              <View style={styles.categoryIconContainer}>
                <Ionicons name="people" size={32} color="#fff" />
              </View>
              <Text style={styles.categoryTitle}>Tour Guides</Text>
              <Text style={styles.categoryCount}>
                {data.guiders.length} available
              </Text>

            </LinearGradient>
          </TouchableOpacity>

          {/* Photographers Card */}
          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => navigation.navigate("PhotographersListScreen")}
          >
            <LinearGradient
              colors={['#83a4b7', '#26536b']}
              style={styles.categoryGradient}
            >
              <View style={styles.categoryIconContainer}>
                <Ionicons name="camera" size={32} color="#fff" />
              </View>
              <Text style={styles.categoryTitle}>Photographers</Text>
              <Text style={styles.categoryCount}>
                {data.photographers.length} available
              </Text>

            </LinearGradient>
          </TouchableOpacity>

          {/* Places Card */}
          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => navigation.navigate("PlaceListScreen")}
          >
            <LinearGradient
              colors={['#255068', '#7696a8']}
              style={styles.categoryGradient}
            >
              <View style={styles.categoryIconContainer}>
                <Ionicons name="map" size={32} color="#fff" />
              </View>
              <Text style={styles.categoryTitle}>Places</Text>
              <Text style={styles.categoryCount}>
                {data.places.length} nearby
              </Text>

            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* TOP PLACES SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.sectionTitle}>Top Rated Places</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("TopPlacesScreen")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading.topPlaces ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2c5a73" />
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {data.topPlaces.length > 0 ? (
                data.topPlaces.map((place) => (
                  <TouchableOpacity
                    key={place.id}
                    style={styles.placeCard}
                    onPress={() => {
                      setSelectedPlace(place);
                      setPlaceModal(true);
                    }}
                  >
                    <LinearGradient
                      colors={['#2c5a73', '#1e3c4f']}
                      style={styles.placeCardGradient}
                    >
                      <Text style={styles.placeName}>{place.placeName}</Text>
                      <View style={styles.placeRating}>
                        {renderRating(place.rating)}
                        <Text style={styles.placeRatingText}>({place.rating?.toFixed(1) || '0.0'})</Text>
                      </View>
                      <Text style={styles.placeLocation}>
                        {place.city}, {place.state}
                      </Text>
                      <View style={styles.placeViews}>
                        <Ionicons name="eye-outline" size={12} color="#fff" />
                        <Text style={styles.placeViewsText}>{place.views || 0} views</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No top places found</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {/* TOP GUIDERS SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="people" size={20} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Top Tour Guides</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("TopGuidersScreen")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading.topGuiders ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2c5a73" />
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {data.topGuiders.length > 0 ? (
                data.topGuiders.map((guider) => (
                  <TouchableOpacity
                    key={guider.id}
                    style={styles.personCard}
                    onPress={() => {
                      setSelectedGuider(guider);
                      setGuiderModal(true);
                    }}
                  >
                    {guider.featuredImage ? (
                      <Image
                        source={{ uri: getImageUrl(guider.featuredImage) }}
                        style={styles.personImage}
                      />
                    ) : (
                      <View style={[styles.personImage, styles.personImagePlaceholder]}>
                        <Text style={styles.personInitial}>
                          {guider.firmName?.charAt(0) || guider.name?.charAt(0) || 'G'}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.personName} numberOfLines={1}>
                      {guider.firmName || guider.name || 'Tour Guide'}
                    </Text>
                    <View style={styles.personRating}>
                      {renderRating(guider.rating)}
                      <Text style={styles.personRatingText}>({guider.rating?.toFixed(1) || '0.0'})</Text>
                    </View>
                    <Text style={styles.personLocation} numberOfLines={1}>
                      {guider.placeName || 'Local Guide'}
                    </Text>
                    <View style={styles.personBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                      <Text style={styles.personBadgeText}>Verified</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No top guides found</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {/* TOP PHOTOGRAPHERS SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="camera" size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Top Photographers</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("TopPhotographers")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading.topPhotographers ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2c5a73" />
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {data.topPhotographers.length > 0 ? (
                data.topPhotographers.map((photographer) => (
                  <TouchableOpacity
                    key={photographer.id}
                    style={styles.personCard}
                    onPress={() => {
                      setSelectedPhotographer(photographer);
                      setPhotographerModal(true);
                    }}
                  >
                    {photographer.featuredImage ? (
                      <Image
                        source={{ uri: getImageUrl(photographer.featuredImage) }}
                        style={styles.personImage}
                      />
                    ) : (
                      <View style={[styles.personImage, styles.personImagePlaceholder]}>
                        <Text style={styles.personInitial}>
                          {photographer.firmName?.charAt(0) || photographer.name?.charAt(0) || 'P'}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.personName} numberOfLines={1}>
                      {photographer.firmName || photographer.name || 'Photographer'}
                    </Text>
                    <View style={styles.personRating}>
                      {renderRating(photographer.rating)}
                      <Text style={styles.personRatingText}>({photographer.rating?.toFixed(1) || '0.0'})</Text>
                    </View>
                    <Text style={styles.personLocation} numberOfLines={1}>
                      {photographer.placeName || 'Local Photographer'}
                    </Text>
                    <View style={styles.personBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                      <Text style={styles.personBadgeText}>Verified</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No top photographers found</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {/* ALL PLACES SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="map" size={20} color="#10B981" />
              <Text style={styles.sectionTitle}>Popular Places Near You</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("PlaceList")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading.places ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2c5a73" />
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {data.places.length > 0 ? (
                data.places.map((place) => (
                  <TouchableOpacity
                    key={place.id}
                    style={styles.placeCardSmall}
                    onPress={() => {
                      setSelectedPlace(place);
                      setPlaceModal(true);
                    }}
                  >
                    <LinearGradient
                      colors={['#2c5a73', '#1e3c4f']}
                      style={styles.placeCardSmallGradient}
                    >
                      <Text style={styles.placeNameSmall}>{place.placeName}</Text>
                      <View style={styles.placeRatingSmall}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={styles.placeRatingTextSmall}>{place.rating?.toFixed(1) || '0.0'}</Text>
                      </View>
                      <Text style={styles.placeLocationSmall}>
                        {place.city}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No places found nearby</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {/* ALL GUIDERS SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="people-outline" size={20} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Available Guides</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("GuiderList")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading.guiders ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2c5a73" />
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {data.guiders.length > 0 ? (
                data.guiders.map((guider) => (
                  <TouchableOpacity
                    key={guider.id}
                    style={styles.personCardSmall}
                    onPress={() => {
                      setSelectedGuider(guider);
                      setGuiderModal(true);
                    }}
                  >
                    {guider.featuredImage ? (
                      <Image
                        source={{ uri: getImageUrl(guider.featuredImage) }}
                        style={styles.personImageSmall}
                      />
                    ) : (
                      <View style={[styles.personImageSmall, styles.personImagePlaceholderSmall]}>
                        <Text style={styles.personInitialSmall}>
                          {guider.firmName?.charAt(0) || guider.name?.charAt(0) || 'G'}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.personNameSmall} numberOfLines={1}>
                      {guider.firmName || guider.name || 'Guide'}
                    </Text>
                    <View style={styles.personRatingSmall}>
                      <Ionicons name="star" size={10} color="#FFD700" />
                      <Text style={styles.personRatingTextSmall}>{guider.rating?.toFixed(1) || '0.0'}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No guides available nearby</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {/* ALL PHOTOGRAPHERS SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="camera-outline" size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Available Photographers</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("PhotographerList")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading.photographers ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2c5a73" />
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {data.photographers.length > 0 ? (
                data.photographers.map((photographer) => (
                  <TouchableOpacity
                    key={photographer.id}
                    style={styles.personCardSmall}
                    onPress={() => {
                      setSelectedPhotographer(photographer);
                      setPhotographerModal(true);
                    }}
                  >
                    {photographer.featuredImage ? (
                      <Image
                        source={{ uri: getImageUrl(photographer.featuredImage) }}
                        style={styles.personImageSmall}
                      />
                    ) : (
                      <View style={[styles.personImageSmall, styles.personImagePlaceholderSmall]}>
                        <Text style={styles.personInitialSmall}>
                          {photographer.firmName?.charAt(0) || photographer.name?.charAt(0) || 'P'}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.personNameSmall} numberOfLines={1}>
                      {photographer.firmName || photographer.name || 'Photographer'}
                    </Text>
                    <View style={styles.personRatingSmall}>
                      <Ionicons name="star" size={10} color="#FFD700" />
                      <Text style={styles.personRatingTextSmall}>{photographer.rating?.toFixed(1) || '0.0'}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No photographers available nearby</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modals */}
      {renderPlaceModal()}
      {renderGuiderModal()}
      {renderPhotographerModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 46,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    zIndex: 50,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuBtn: {
    padding: 4,
  },
  locationContainer: {
    alignItems: 'center',
  },
  greeting: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    color: '#fff',
    fontSize: 12,
    marginHorizontal: 4,
    maxWidth: 140,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 14,
  },
  heroSection: {
    marginTop: -10,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginTop: 25,
  },
  heroContent: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#e2e8f0',
  },
  searchBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 28,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },

  // ===== Category Cards Styles =====
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  categoryCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryGradient: {
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  categoryArrow: {
    position: 'absolute',
    top: 12,
    right: 12,
  },

  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 6,
  },
  seeAllText: {
    fontSize: 14,
    color: '#2c5a73',
    fontWeight: '600',
  },
  placeCard: {
    width: 200,
    height: 120,
    marginLeft: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  placeCardGradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  placeName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  placeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  placeRatingText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  placeLocation: {
    color: '#e2e8f0',
    fontSize: 11,
    marginTop: 4,
  },
  placeViews: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  placeViewsText: {
    color: '#e2e8f0',
    fontSize: 10,
    marginLeft: 4,
  },
  personCard: {
    width: 150,
    marginLeft: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  personImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
  },
  personImagePlaceholder: {
    backgroundColor: '#2c5a73',
    justifyContent: 'center',
    alignItems: 'center',
  },
  personInitial: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  personName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  personRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  personRatingText: {
    fontSize: 11,
    color: '#64748b',
    marginLeft: 4,
  },
  personLocation: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 4,
  },
  personBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  personBadgeText: {
    fontSize: 10,
    color: '#10B981',
    marginLeft: 2,
    fontWeight: '600',
  },
  placeCardSmall: {
    width: 120,
    height: 100,
    marginLeft: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  placeCardSmallGradient: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  placeNameSmall: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  placeRatingSmall: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeRatingTextSmall: {
    color: '#fff',
    fontSize: 11,
    marginLeft: 4,
  },
  placeLocationSmall: {
    color: '#e2e8f0',
    fontSize: 10,
  },
  personCardSmall: {
    width: 100,
    marginLeft: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    elevation: 2,
  },
  personImageSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 6,
  },
  personImagePlaceholderSmall: {
    backgroundColor: '#2c5a73',
    justifyContent: 'center',
    alignItems: 'center',
  },
  personInitialSmall: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  personNameSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 2,
  },
  personRatingSmall: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personRatingTextSmall: {
    fontSize: 10,
    color: '#64748b',
    marginLeft: 2,
  },
  loadingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyCard: {
    width: 200,
    height: 100,
    marginLeft: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 12,
  },
  modalImagePlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalProfileHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  modalProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  modalProfileInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalRating: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modalRatingText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 4,
  },
  modalLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalLocationText: {
    fontSize: 13,
    color: '#1e293b',
    marginLeft: 4,
  },
  modalVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    alignSelf: 'center',
  },
  modalVerifiedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 4,
  },
  modalDescription: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 16,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  modalStat: {
    alignItems: 'center',
  },
  modalStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 2,
  },
  modalStatLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  modalButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});