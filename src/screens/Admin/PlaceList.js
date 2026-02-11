import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import api from "../../api/apiClient";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

const BASE_URL = "http://31.97.227.108:8081";

// 🔥 FIXED IMAGE URL FUNCTION
const getImageUrl = (path) => {
  if (!path) {
    console.log("🖼️ No image path provided");
    return "https://via.placeholder.com/150";
  }
  
  console.log("🖼️ Raw image path:", path);
  
  // If already full URL
  if (path.startsWith("http")) {
    console.log("🖼️ Already full URL:", path);
    return path;
  }
  
  // Try different patterns based on your backend
  const cleanPath = path.replace(/^\/+/, "");
  
  // Pattern 1: Direct file in Uploads folder
  const url1 = `${BASE_URL}/Uploads/${cleanPath}`;
  console.log("🖼️ Trying URL 1:", url1);
  
  // Pattern 2: Direct file in root
  const url2 = `${BASE_URL}/${cleanPath}`;
  console.log("🖼️ Trying URL 2:", url2);
  
  // Pattern 3: With uploads lowercase
  const url3 = `${BASE_URL}/uploads/${cleanPath}`;
  
  // Return the most likely one
  return url1;
};

// Placeholder component for debugging
const DebugImage = ({ source, style }) => {
  const [error, setError] = useState(false);
  
  const handleError = () => {
    console.log("❌ Image failed to load:", source);
    setError(true);
  };
  
  if (error || !source?.uri) {
    return (
      <View style={[style, styles.imageError]}>
        <Icon name="image-off" size={24} color="#cbd5e1" />
        <Text style={styles.imageErrorText}>No Image</Text>
      </View>
    );
  }
  
  return (
    <Image
      source={source}
      style={style}
      onError={handleError}
      resizeMode="cover"
    />
  );
};

export default function PlaceList({ navigation }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states - same as before
  const [placeName, setPlaceName] = useState("");
  const [description, setDescription] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [topPlace, setTopPlace] = useState(false);
  const [openAllDay, setOpenAllDay] = useState(true);
  const [timing, setTiming] = useState("");
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    loadPlaces();
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload images.');
      }
    })();
  }, []);

  const loadPlaces = async () => {
    try {
      setLoading(true);
      console.log("📡 Loading places...");
      const res = await api.post("/places/get", { 
        page: 1, 
        perPage: 50 
      });
      
      console.log("📍 API Response status:", res.data?.status);
      console.log("📍 API Response message:", res.data?.message);
      
      const placesData = res.data?.data || [];
      console.log(`📍 Places loaded: ${placesData.length}`);
      
      // Debug: Check first place's image
      if (placesData.length > 0) {
        console.log("📍 First place data:", placesData[0]);
        const firstPlace = placesData[0];
        console.log("📍 First place image path:", firstPlace.featuredImage);
        console.log("📍 Generated URL:", getImageUrl(firstPlace.featuredImage));
      }
      
      setPlaces(Array.isArray(placesData) ? placesData : []);
    } catch (e) {
      console.error("❌ Error loading places:", e.response?.data || e.message);
      Alert.alert("Error", "Failed to load places");
    } finally {
      setLoading(false);
    }
  };

  // Test image URLs manually
  const testImageUrls = () => {
    console.log("🔍 Testing image URLs:");
    
    // Test the current places
    places.forEach((place, index) => {
      const url = getImageUrl(place.featuredImage);
      console.log(`📷 Place ${index}: ${place.placeName}`);
      console.log(`📷 Image path: ${place.featuredImage}`);
      console.log(`📷 Generated URL: ${url}`);
      console.log("---");
    });
    
    // Test direct access
    Alert.alert(
      "Test Image URLs",
      `Checking ${places.length} places. Check console for details.`,
      [{ text: "OK" }]
    );
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0];
        console.log("📸 Selected image:", selectedImage.uri);
        setImage(selectedImage);
        setImageError(false);
      }
    } catch (error) {
      console.error("❌ Image picker error:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  // 🔥 FIXED SAVE FUNCTION - Test Version
  const handleSavePlace = async () => {
    if (!placeName.trim()) {
      Alert.alert("Error", "Place name is required");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Error", "Description is required");
      return;
    }
    if (!state.trim()) {
      Alert.alert("Error", "State is required");
      return;
    }
    if (!city.trim()) {
      Alert.alert("Error", "City is required");
      return;
    }
    if (!latitude.trim() || isNaN(parseFloat(latitude))) {
      Alert.alert("Error", "Valid latitude is required");
      return;
    }
    if (!longitude.trim() || isNaN(parseFloat(longitude))) {
      Alert.alert("Error", "Valid longitude is required");
      return;
    }
    if (!image) {
      setImageError(true);
      Alert.alert("Error", "Please select an image");
      return;
    }

    try {
      setSaving(true);
      
      // Create FormData
      const formData = new FormData();
      
      // Add text fields
      formData.append("placeName", placeName.trim());
      formData.append("description", description.trim());
      formData.append("state", state.trim());
      formData.append("city", city.trim());
      formData.append("latitude", parseFloat(latitude).toString());
      formData.append("longitude", parseFloat(longitude).toString());
      formData.append("address", address.trim() || `${city}, ${state}, India`);
      formData.append("fullAddress", address.trim() || `${city}, ${state}, India`);
      
      // Optional fields
      if (mapUrl.trim()) formData.append("mapUrl", mapUrl.trim());
      formData.append("topPlace", topPlace ? "true" : "false");
      formData.append("openAllDay", openAllDay ? "true" : "false");
      if (timing.trim()) formData.append("timing", timing.trim());
      
      // Add image - IMPORTANT: Use correct field name
      const imageUri = image.uri;
      const imageName = `place_${Date.now()}.jpg`;
      
      formData.append("featuredImage", {
        uri: imageUri,
        name: imageName,
        type: 'image/jpeg',
      });
      
      console.log("📤 Sending place data...");
      console.log("Place Name:", placeName);
      console.log("Image Name:", imageName);
      
      // Send request
      const response = await api.post("/places/add", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log("✅ Save response:", response.data);
      
      if (response.data?.status === true) {
        Alert.alert("Success", "Place added successfully!", [
          {
            text: "OK",
            onPress: () => {
              resetForm();
              setModalVisible(false);
              loadPlaces();
            }
          }
        ]);
      } else {
        Alert.alert("Error", response.data?.message || "Failed to add place");
      }
      
    } catch (error) {
      console.error("❌ Save error:", error.response?.data || error.message);
      Alert.alert(
        "Error", 
        error.response?.data?.message || "Failed to save place. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setPlaceName("");
    setDescription("");
    setState("");
    setCity("");
    setLatitude("");
    setLongitude("");
    setAddress("");
    setMapUrl("");
    setTopPlace(false);
    setOpenAllDay(true);
    setTiming("");
    setImage(null);
    setImageError(false);
  };

  const deletePlace = async (placeId) => {
    Alert.alert(
      "Delete Place",
      "Are you sure you want to delete this place?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await api.delete("/places/delete", {
                data: { placeId }
              });
              
              if (response.data?.status) {
                Alert.alert("Success", "Place deleted successfully");
                loadPlaces();
              } else {
                Alert.alert("Error", response.data?.message || "Failed to delete");
              }
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Failed to delete place");
            }
          }
        }
      ]
    );
  };

  const renderPlaceItem = ({ item }) => {
    const imageUrl = getImageUrl(item.featuredImage);
    console.log(`🖼️ Rendering place: ${item.placeName}`);
    console.log(`🖼️ Image URL: ${imageUrl}`);
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate("PlaceDetails", { placeId: item.id })}
      >
        <View style={styles.cardContent}>
          {/* Use DebugImage component */}
          <DebugImage
            source={{ uri: imageUrl }}
            style={styles.image}
          />
          
          <View style={styles.cardInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {item.placeName || "Unnamed Place"}
              </Text>
              {item.isTop && (
                <View style={styles.topBadge}>
                  <Icon name="crown" size={12} color="#fff" />
                  <Text style={styles.topBadgeText}>Top</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.description} numberOfLines={2}>
              {item.description || "No description"}
            </Text>
            
            <View style={styles.locationRow}>
              <Icon name="map-marker" size={14} color="#666" />
              <Text style={styles.locationText}>
                {item.city || "Unknown City"}, {item.state || "Unknown State"}
              </Text>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="eye" size={12} color="#666" />
                <Text style={styles.statText}>{item.views || 0} views</Text>
              </View>
              
              <View style={styles.statItem}>
                <Icon name="star" size={12} color="#F59E0B" />
                <Text style={styles.statText}>{item.rating || 0} rating</Text>
              </View>
              
              {item.openAllDay && (
                <View style={styles.statItem}>
                  <Icon name="clock-outline" size={12} color="#10B981" />
                  <Text style={[styles.statText, styles.openText]}>24/7</Text>
                </View>
              )}
            </View>
            
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => navigation.navigate("EditPlace", { placeId: item.id })}
              >
                <Icon name="pencil" size={16} color="#3B82F6" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => deletePlace(item.id)}
              >
                <Icon name="delete" size={16} color="#EF4444" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#42738f" />
        <Text style={styles.loadingText}>Loading places...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Tourist Places</Text>
            <Text style={styles.headerSubtitle}>{places.length} places found</Text>
          </View>
          <TouchableOpacity 
            style={styles.testButton}
            onPress={testImageUrls}
          >
            <Icon name="debug-step-over" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Places List */}
      {places.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="map-marker-off" size={64} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No Places Found</Text>
          <Text style={styles.emptySubtitle}>
            Add your first tourist place to get started
          </Text>
          <TouchableOpacity 
            style={styles.addFirstButton}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="plus" size={20} color="#fff" />
            <Text style={styles.addFirstButtonText}>Add First Place</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={places}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={renderPlaceItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadPlaces}
        />
      )}

      {/* Add Place FAB */}
      {places.length > 0 && (
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => setModalVisible(true)}
        >
          <Icon name="plus" size={26} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Modal - same as before */}
      {/* ... Modal code remains the same ... */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  testButton: {
    backgroundColor: "#8B5CF6",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 24,
  },
  addFirstButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#42738f",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
  },
  addFirstButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "row",
  },
  image: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  imageError: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  imageErrorText: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
  },
  cardInfo: {
    flex: 1,
    padding: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    flex: 1,
  },
  topBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F59E0B",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  topBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 4,
  },
  description: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 8,
    lineHeight: 18,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  statText: {
    fontSize: 11,
    color: "#666",
    marginLeft: 4,
  },
  openText: {
    color: "#10B981",
    fontWeight: "500",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    marginRight: 8,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#3B82F6",
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#EF4444",
    marginLeft: 4,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#42738f",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  // ... rest of the styles remain the same
});