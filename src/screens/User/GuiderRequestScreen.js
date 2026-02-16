import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const BASE_URL = "http://31.97.227.108:8081";

// ✅ FIXED: Allowed ID proof types from backend - matches allowedGovtIdTypes
const ID_PROOF_TYPES = [
  "Aadhaar",
  "PAN Card",
  "Voter ID",
  "Driving License",
  "Passport"
];

export default function GuiderRequestScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const getTokenFromStorage = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        setToken(storedToken);
        console.log("🔐 Token loaded:", storedToken ? "Yes" : "No");
      } catch (error) {
        console.error("Error loading token:", error);
      }
    };
    getTokenFromStorage();
  }, []);

  // ✅ FIXED: Form state matches backend exactly
  const [form, setForm] = useState({
    userId: user?.id?.toString() || "",
    firmName: "",
    featuredImage: null,
    idProofFront: null,
    idProofBack: null,
    photograph: null,
    idProofType: "Aadhaar", // ✅ Default matches backend
    description: "",
    phone: user?.phone || "",
    email: user?.email || "",
    placeId: "",
    places: "",
    address: "",
    services: [], // ✅ Start with empty array, add via button
  });

  // ✅ Add service function
  const addService = () => {
    setForm(prev => ({
      ...prev,
      services: [
        ...prev.services,
        {
          title: "",
          description: "",
          servicePrice: "",
          image: null
        }
      ]
    }));
  };

  // ✅ Remove service function
  const removeService = (index) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  // ✅ Update service field
  const updateServiceField = (index, field, value) => {
    setForm(prev => {
      const newServices = [...prev.services];
      newServices[index][field] = value;
      return { ...prev, services: newServices };
    });
  };

  // ✅ Helper to always return correct download URL
  const getImageUrl = (path) => {
    if (!path) return null;
    if (typeof path === 'string' && path.includes("/api/image/download/")) return path;
    if (path.uri) return path.uri;
    return `${BASE_URL}/api/image/download/${path}`;
  };

  // ✅ Image picker - matches backend field names
  const pickImage = async (field) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photo library.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const image = result.assets[0];
        const imageData = {
          uri: image.uri,
          type: image.mimeType || 'image/jpeg',
          name: `${field}_${Date.now()}.jpg`,
        };
        setForm(prev => ({ ...prev, [field]: imageData }));
        console.log(`✅ ${field} image selected`);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  // ✅ Service image picker
  const handleServiceImageSelect = async (index) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photo library.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const image = result.assets[0];
        const imageData = {
          uri: image.uri,
          type: image.mimeType || 'image/jpeg',
          name: `service_${Date.now()}_${index}.jpg`,
        };
        updateServiceField(index, 'image', imageData);
        console.log(`✅ Service ${index + 1} image selected`);
      }
    } catch (error) {
      console.error("Service image picker error:", error);
      Alert.alert("Error", "Failed to pick service image");
    }
  };

  // ✅ Create FormData - EXACT match with backend expectations
  const createFormData = () => {
    const formData = new FormData();
    
    // ✅ Required fields - match backend @RequestParam names exactly
    const fields = {
      userId: form.userId,
      firmName: form.firmName,
      idProofType: form.idProofType,
      description: form.description,
      phone: form.phone,
      email: form.email,
      placeId: form.placeId,
      places: form.places,
      address: form.address,
    };

    // Append text fields
    Object.entries(fields).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    // ✅ Helper to append file
    const addFile = (fieldName, file) => {
      if (file && file.uri) {
        const filename = file.uri.split('/').pop();
        formData.append(fieldName, {
          uri: file.uri,
          name: filename || `${fieldName}.jpg`,
          type: file.type || 'image/jpeg',
        });
      }
    };

    // ✅ Required files (backend requires these)
    addFile("featuredImage", form.featuredImage);
    addFile("idProofFront", form.idProofFront);
    addFile("idProofBack", form.idProofBack);
    addFile("photograph", form.photograph);

    // ✅ Services array - matches backend parsing
    form.services.forEach((service, idx) => {
      formData.append(`services[${idx}][title]`, service.title || "");
      formData.append(`services[${idx}][description]`, service.description || "");
      formData.append(`services[${idx}][servicePrice]`, service.servicePrice || "");
      if (service.image) {
        addFile(`services[${idx}][image]`, service.image);
      }
    });

    return formData;
  };

  // ✅ Validation - matches backend requirements
  const validateForm = () => {
    if (!form.userId) {
      Alert.alert("Error", "User ID is required");
      return false;
    }
    if (!form.firmName.trim()) {
      Alert.alert("Error", "Firm/Company name is required");
      return false;
    }
    if (!form.idProofFront) {
      Alert.alert("Error", "ID Proof Front is required");
      return false;
    }
    if (!form.idProofBack) {
      Alert.alert("Error", "ID Proof Back is required");
      return false;
    }
    if (!form.photograph) {
      Alert.alert("Error", "Your photograph is required");
      return false;
    }
    if (!form.address.trim()) {
      Alert.alert("Error", "Address is required");
      return false;
    }
    if (!form.phone.trim()) {
      Alert.alert("Error", "Phone number is required");
      return false;
    }
    if (!form.placeId.trim()) {
      Alert.alert("Error", "Primary place ID is required");
      return false;
    }
    if (!form.places.trim()) {
      Alert.alert("Error", "Places information is required");
      return false;
    }
    if (!ID_PROOF_TYPES.includes(form.idProofType)) {
      Alert.alert("Error", "Invalid ID proof type");
      return false;
    }
    if (form.services.length === 0) {
      Alert.alert("Error", "At least one service is required");
      return false;
    }

    // Validate each service
    for (let i = 0; i < form.services.length; i++) {
      const service = form.services[i];
      if (!service.title.trim()) {
        Alert.alert("Error", `Service ${i + 1}: Title is required`);
        return false;
      }
      if (!service.description.trim()) {
        Alert.alert("Error", `Service ${i + 1}: Description is required`);
        return false;
      }
      if (!service.servicePrice || parseFloat(service.servicePrice) <= 0) {
        Alert.alert("Error", `Service ${i + 1}: Valid price is required`);
        return false;
      }
    }

    return true;
  };

  // ✅ Submit handler - matches backend endpoint
  const handleSubmit = async () => {
    if (!token) {
      Alert.alert("Login Required", "Please login first to submit request.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const formData = createFormData();

      // ✅ CORRECT ENDPOINT - matches backend controller
      const response = await fetch(`${BASE_URL}/api/guider/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      let responseData;
      try {
        const text = await response.text();
        responseData = text ? JSON.parse(text) : {};
      } catch {
        responseData = {};
      }

      console.log("📥 Response:", response.status, responseData);

      if (response.ok && responseData.status === true) {
        Alert.alert(
          "Success! 🎉",
          "Your guider application has been submitted successfully. You will be notified within 24-48 hours.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          "Submission Failed",
          responseData.message || "Unable to process your request. Please check all required fields."
        );
      }
    } catch (error) {
      console.error("❌ Submission error:", error.message);
      Alert.alert("Error", error.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Render image preview
  const renderImagePreview = (image, label, field, required = false) => (
    <TouchableOpacity style={styles.imageUploadBox} onPress={() => pickImage(field)}>
      {image ? (
        <View style={styles.imagePreview}>
          <Image source={{ uri: image.uri }} style={styles.previewImage} />
          <View style={styles.imageInfo}>
            <Text style={styles.imageName}>{label}{required ? ' *' : ''}</Text>
            <Text style={styles.changeText}>✓ Selected</Text>
          </View>
        </View>
      ) : (
        <View style={styles.uploadPlaceholder}>
          <Ionicons name="cloud-upload-outline" size={32} color="#94a3b8" />
          <Text style={styles.uploadLabel}>{label}{required ? ' *' : ''}</Text>
          <Text style={styles.uploadHint}>Tap to select</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Become a Tourist Guide</Text>
            <Text style={styles.subtitle}>Share your local knowledge with travelers</Text>
          </View>
        </View>

        <View style={styles.content}>
          
          {/* Basic Information */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📋 Basic Information</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Firm/Company Name *"
              placeholderTextColor="#94a3b8"
              value={form.firmName}
              onChangeText={(text) => setForm({...form, firmName: text})}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description * (Tell tourists about yourself and your services)"
              placeholderTextColor="#94a3b8"
              value={form.description}
              onChangeText={(text) => setForm({...form, description: text})}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="Phone Number *"
                placeholderTextColor="#94a3b8"
                value={form.phone}
                onChangeText={(text) => setForm({...form, phone: text})}
                keyboardType="phone-pad"
                maxLength={10}
              />
              
              <TextInput
                style={[styles.input, { flex: 1, marginLeft: 8 }]}
                placeholder="Email Address"
                placeholderTextColor="#94a3b8"
                value={form.email}
                onChangeText={(text) => setForm({...form, email: text})}
                keyboardType="email-address"
              />
            </View>
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Full Address *"
              placeholderTextColor="#94a3b8"
              value={form.address}
              onChangeText={(text) => setForm({...form, address: text})}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Place Information */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📍 Service Areas</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Primary Place ID * (e.g., 1,2,3...)"
              placeholderTextColor="#94a3b8"
              value={form.placeId}
              onChangeText={(text) => setForm({...form, placeId: text})}
              keyboardType="number-pad"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Other Places * (comma separated IDs, e.g., 2,4,6)"
              placeholderTextColor="#94a3b8"
              value={form.places}
              onChangeText={(text) => setForm({...form, places: text})}
            />
            
            <Text style={styles.hintText}>
              💡 You can serve in multiple areas. Enter place IDs separated by commas.
            </Text>
          </View>

          {/* ID Proof */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🪪 ID Proof & Documents</Text>
            
            <Text style={styles.label}>ID Proof Type *</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.idTypeScroll}
            >
              {ID_PROOF_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.idTypeBtn,
                    form.idProofType === type && styles.idTypeBtnActive
                  ]}
                  onPress={() => setForm({...form, idProofType: type})}
                >
                  <Text style={[
                    styles.idTypeText,
                    form.idProofType === type && styles.idTypeTextActive
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.docGrid}>
              <View style={styles.docColumn}>
                {renderImagePreview(form.idProofFront, "ID Proof Front", "idProofFront", true)}
                {renderImagePreview(form.photograph, "Your Photograph", "photograph", true)}
              </View>
              <View style={styles.docColumn}>
                {renderImagePreview(form.idProofBack, "ID Proof Back", "idProofBack", true)}
                {renderImagePreview(form.featuredImage, "Featured Image", "featuredImage", false)}
              </View>
            </View>
            
            <Text style={styles.hintText}>
              ⚠️ Upload clear, readable images of your documents
            </Text>
          </View>

          {/* Services - Required by backend */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>📸 Your Services *</Text>
              <TouchableOpacity onPress={addService} style={styles.addBtn}>
                <Ionicons name="add-circle" size={22} color="#42738f" />
                <Text style={styles.addBtnText}>Add Service</Text>
              </TouchableOpacity>
            </View>

            {form.services.length === 0 ? (
              <View style={styles.emptyServices}>
                <Ionicons name="alert-circle-outline" size={40} color="#94a3b8" />
                <Text style={styles.emptyServicesText}>
                  Add at least one service to continue
                </Text>
              </View>
            ) : (
              form.services.map((service, idx) => (
                <View key={idx} style={styles.serviceCard}>
                  <View style={styles.serviceHeader}>
                    <Text style={styles.serviceNumber}>Service {idx + 1}</Text>
                    {form.services.length > 1 && (
                      <TouchableOpacity onPress={() => removeService(idx)}>
                        <Ionicons name="close-circle" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Service Title * (e.g., Heritage Walk, City Tour)"
                    placeholderTextColor="#94a3b8"
                    value={service.title}
                    onChangeText={(text) => updateServiceField(idx, 'title', text)}
                  />
                  
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Description * (What's included in this tour?)"
                    placeholderTextColor="#94a3b8"
                    value={service.description}
                    onChangeText={(text) => updateServiceField(idx, 'description', text)}
                    multiline
                    numberOfLines={3}
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Price (₹) *"
                    placeholderTextColor="#94a3b8"
                    value={service.servicePrice}
                    onChangeText={(text) => updateServiceField(idx, 'servicePrice', text)}
                    keyboardType="number-pad"
                  />
                  
                  <TouchableOpacity 
                    style={styles.serviceImageBtn}
                    onPress={() => handleServiceImageSelect(idx)}
                  >
                    {service.image ? (
                      <View style={styles.serviceImagePreview}>
                        <Image source={{ uri: service.image.uri }} style={styles.servicePreviewImg} />
                        <View style={styles.serviceImageInfo}>
                          <Text style={styles.serviceImageText}>✓ Image selected</Text>
                          <Text style={styles.changeImageText}>Tap to change</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.serviceUploadPlaceholder}>
                        <Ionicons name="image-outline" size={20} color="#94a3b8" />
                        <Text style={styles.serviceImageText}>Add Service Image (Recommended)</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              ))
            )}
            
            <Text style={styles.hintText}>
              💡 Keep prices competitive to get more bookings
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="paper-plane-outline" size={20} color="#fff" />
                <Text style={styles.submitText}>Submit Application</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.noteBox}>
            <Ionicons name="information-circle" size={16} color="#42738f" />
            <Text style={styles.noteText}>
              * Required fields. Your application will be reviewed within 24-48 hours. 
              You'll receive a notification once approved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8fafc" 
  },
  header: {
    backgroundColor: "#42738f",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
  },
  content: { 
    padding: 16, 
    paddingBottom: 40 
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    color: "#1e293b",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
  },
  label: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 8,
    fontWeight: "500",
  },
  hintText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 8,
    fontStyle: "italic",
  },
  idTypeScroll: {
    flexDirection: "row",
    marginBottom: 16,
  },
  idTypeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    marginRight: 8,
  },
  idTypeBtnActive: {
    backgroundColor: "#42738f",
  },
  idTypeText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  idTypeTextActive: {
    color: "#fff",
  },
  docGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  docColumn: {
    width: "48%",
  },
  imageUploadBox: {
    marginBottom: 12,
  },
  uploadPlaceholder: {
    height: 110,
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  uploadLabel: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
    marginTop: 8,
    textAlign: "center",
  },
  uploadHint: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
    textAlign: "center",
  },
  imagePreview: {
    height: 110,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  previewImage: {
    width: "100%",
    height: 70,
    resizeMode: "cover",
  },
  imageInfo: {
    padding: 8,
  },
  imageName: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
  },
  changeText: {
    fontSize: 11,
    color: "#10B981",
    marginTop: 2,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addBtnText: {
    color: "#42738f",
    fontSize: 14,
    marginLeft: 4,
    fontWeight: "500",
  },
  emptyServices: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  emptyServicesText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
  },
  serviceCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceNumber: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
  },
  serviceImageBtn: {
    marginTop: 8,
  },
  serviceImagePreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  servicePreviewImg: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  serviceImageInfo: {
    flex: 1,
  },
  serviceImageText: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "500",
  },
  changeImageText: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  serviceUploadPlaceholder: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
  },
  submitBtn: {
    backgroundColor: "#42738f",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  submitBtnDisabled: {
    backgroundColor: "#94a3b8",
    opacity: 0.7,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  noteBox: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  noteText: {
    color: "#64748b",
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
});