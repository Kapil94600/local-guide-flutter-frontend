import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function GuiderRequestScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
    userId: user?.id || 1,
    firmName: "",
    idProofType: "",
    description: "",
    phone: "",
    email: "",
    placeId: "",
    places: "",
    address: "",
    services: [
      { title: "", description: "", servicePrice: "", image: null },
      { title: "", description: "", servicePrice: "", image: null },
    ],
  });

  const [featuredImage, setFeaturedImage] = useState(null);
  const [idProofFront, setIdProofFront] = useState(null);
  const [idProofBack, setIdProofBack] = useState(null);
  const [photograph, setPhotograph] = useState(null);

  // File picker helper
  const pickFile = async (setter) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/jpeg", "image/png"],
    });
    if (result.type === "success") {
      setter(result);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      formData.append("userId", form.userId);
      formData.append("firmName", form.firmName);
      formData.append("idProofType", form.idProofType);
      formData.append("description", form.description);
      formData.append("phone", form.phone);
      formData.append("email", form.email);
      formData.append("placeId", form.placeId);
      formData.append("places", form.places);
      formData.append("address", form.address);

      // Files
      if (featuredImage)
        formData.append("featuredImage", {
          uri: featuredImage.uri,
          type: "image/jpeg",
          name: "featured.jpg",
        });
      if (idProofFront)
        formData.append("idProofFront", {
          uri: idProofFront.uri,
          type: "image/jpeg",
          name: "idFront.jpg",
        });
      if (idProofBack)
        formData.append("idProofBack", {
          uri: idProofBack.uri,
          type: "image/jpeg",
          name: "idBack.jpg",
        });
      if (photograph)
        formData.append("photograph", {
          uri: photograph.uri,
          type: "image/jpeg",
          name: "photo.jpg",
        });

      // Services
      form.services.forEach((s, idx) => {
        formData.append(`services[${idx}][title]`, s.title);
        formData.append(`services[${idx}][description]`, s.description);
        formData.append(`services[${idx}][servicePrice]`, s.servicePrice);
        if (s.image) {
          formData.append(`services[${idx}][image]`, {
            uri: s.image.uri,
            type: "image/jpeg",
            name: `service${idx}.jpg`,
          });
        }
      });

      const res = await axios.post(
        "http://31.97.227.108:8081/api/guider/request",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      Alert.alert("Success", "Guider request submitted!");
      navigation.goBack();
    } catch (err) {
      console.error("❌ Error submitting request:", err);
      Alert.alert("Error", "Failed to submit request");
    }
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
        Guider Request Form
      </Text>

      <TextInput
        placeholder="Firm Name"
        value={form.firmName}
        onChangeText={(t) => setForm({ ...form, firmName: t })}
        style={{ borderBottomWidth: 1, marginBottom: 12 }}
      />

      <TextInput
        placeholder="ID Proof Type"
        value={form.idProofType}
        onChangeText={(t) => setForm({ ...form, idProofType: t })}
        style={{ borderBottomWidth: 1, marginBottom: 12 }}
      />

      <TextInput
        placeholder="Description"
        value={form.description}
        onChangeText={(t) => setForm({ ...form, description: t })}
        style={{ borderBottomWidth: 1, marginBottom: 12 }}
      />

      <TextInput
        placeholder="Phone"
        value={form.phone}
        onChangeText={(t) => setForm({ ...form, phone: t })}
        style={{ borderBottomWidth: 1, marginBottom: 12 }}
      />

      <TextInput
        placeholder="Email"
        value={form.email}
        onChangeText={(t) => setForm({ ...form, email: t })}
        style={{ borderBottomWidth: 1, marginBottom: 12 }}
      />

      <TextInput
        placeholder="Place ID"
        value={form.placeId}
        onChangeText={(t) => setForm({ ...form, placeId: t })}
        style={{ borderBottomWidth: 1, marginBottom: 12 }}
      />

      <TextInput
        placeholder="Places (comma separated)"
        value={form.places}
        onChangeText={(t) => setForm({ ...form, places: t })}
        style={{ borderBottomWidth: 1, marginBottom: 12 }}
      />

      <TextInput
        placeholder="Address"
        value={form.address}
        onChangeText={(t) => setForm({ ...form, address: t })}
        style={{ borderBottomWidth: 1, marginBottom: 12 }}
      />

      {/* File Pickers */}
      <TouchableOpacity onPress={() => pickFile(setFeaturedImage)}>
        <Text style={{ marginVertical: 8 }}>Upload Featured Image</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => pickFile(setIdProofFront)}>
        <Text style={{ marginVertical: 8 }}>Upload ID Proof Front</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => pickFile(setIdProofBack)}>
        <Text style={{ marginVertical: 8 }}>Upload ID Proof Back</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => pickFile(setPhotograph)}>
        <Text style={{ marginVertical: 8 }}>Upload Photograph</Text>
      </TouchableOpacity>

      {/* Services */}
      {form.services.map((s, idx) => (
        <View key={idx} style={{ marginVertical: 12 }}>
          <Text>Service {idx + 1}</Text>
          <TextInput
            placeholder="Title"
            value={s.title}
            onChangeText={(t) => {
              const updated = [...form.services];
              updated[idx].title = t;
              setForm({ ...form, services: updated });
            }}
            style={{ borderBottomWidth: 1, marginBottom: 8 }}
          />
          <TextInput
            placeholder="Description"
            value={s.description}
            onChangeText={(t) => {
              const updated = [...form.services];
              updated[idx].description = t;
              setForm({ ...form, services: updated });
            }}
            style={{ borderBottomWidth: 1, marginBottom: 8 }}
          />
          <TextInput
            placeholder="Price"
            value={s.servicePrice}
            onChangeText={(t) => {
              const updated = [...form.services];
              updated[idx].servicePrice = t;
              setForm({ ...form, services: updated });
            }}
            style={{ borderBottomWidth: 1, marginBottom: 8 }}
          />
          <TouchableOpacity
            onPress={() =>
              pickFile((file) => {
                const updated = [...form.services];
                updated[idx].image = file;
                setForm({ ...form, services: updated });
              })
            }
          >
            <Text style={{ marginVertical: 8 }}>Upload Service Image</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Button title="Submit Request" onPress={handleSubmit} />
    </ScrollView>
  );
}
