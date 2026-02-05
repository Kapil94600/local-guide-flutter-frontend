import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import api from "../../api/apiClient";
import { API } from "../../api/endpoints";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

export default function PlaceGallery({ route }) {
  const { placeId } = route.params;
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await api.post(API.ALL_IMAGES_BY_ID || "/images/get_by_id", {
        placeId,
      });
      setImages(res.data?.data || []);
    } catch (e) {
      console.log("Gallery error:", e.message);
    }
  };

  const pickAndUpload = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (res.canceled) return;

    const formData = new FormData();
    formData.append("image", {
      uri: res.assets[0].uri,
      name: "place.jpg",
      type: "image/jpeg",
    });
    formData.append("placeId", placeId);

    await api.post(API.ADD_IMAGE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    fetchImages();
  };

  const deleteImage = (imageId) => {
    Alert.alert("Delete Image", "Confirm delete?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await api.post(API.DELETE_IMAGE, { imageId });
          fetchImages();
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onLongPress={() => deleteImage(item.id)}>
      <Image source={{ uri: item.url }} style={styles.image} />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={images}
        keyExtractor={(i) => i.id.toString()}
        numColumns={3}
        contentContainerStyle={{ padding: 6 }}
        renderItem={renderItem}
      />

      <TouchableOpacity style={styles.fab} onPress={pickAndUpload}>
        <Icon name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "31%",
    height: 110,
    margin: "1%",
    borderRadius: 10,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3F51B5",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});
