import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
  Modal,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import api from "../../api/apiClient";

export default function GuiderRequests({ navigation }) {
  const [guiders, setGuiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGuider, setSelectedGuider] = useState(null);
  const [actionModal, setActionModal] = useState(false);

  const loadGuiderRequests = async () => {
    try {
      const response = await api.post("/guider/get_all", {
        admin: true,
      });
      
      const responseData = response.data || {};
      const allGuiders = responseData.data || [];
      
      // ✅ ONLY SHOW PENDING REQUESTS
      const pendingGuiders = allGuiders.filter(guider => 
        guider.approvalStatus === "PENDING" || 
        !guider.approvalStatus || 
        guider.approvalStatus === ""
      );
      
      console.log("Pending guider requests:", pendingGuiders.length);
      setGuiders(pendingGuiders);
    } catch (error) {
      console.error("Error loading guider requests:", error);
      Alert.alert("Error", "Failed to load guider requests");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadGuiderRequests();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadGuiderRequests();
  };

  const handleApproveReject = async (guiderId, action) => {
    try {
      const formData = new FormData();
      formData.append("gId", guiderId);
      formData.append("status", action === "approve" ? "Approved" : "DECLINED");

      const response = await api.post("/guider/respond_on_request", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.status) {
        Alert.alert("Success", `Guider ${action === "approve" ? "approved" : "rejected"} successfully`);
        setActionModal(false);
        setSelectedGuider(null);
        loadGuiderRequests();
      } else {
        Alert.alert("Error", response.data?.message || "Failed to process request");
      }
    } catch (error) {
      console.error("Error processing request:", error);
      Alert.alert("Error", "Failed to process request");
    }
  };

  const renderGuiderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {
        setSelectedGuider(item);
        setActionModal(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          {item.photograph ? (
            <Image 
              source={{ uri: item.photograph }} 
              style={styles.avatarImage}
            />
          ) : (
            <Icon name="map-marker-account" size={24} color="#3a0250e3" />
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.name}>{item.firmName || item.name || "Unnamed Guider"}</Text>
          <Text style={styles.email}>{item.email || "No email"}</Text>
          <Text style={styles.phone}>{item.phone || "No phone"}</Text>
        </View>
        <View style={styles.pendingBadge}>
          <Icon name="clock" size={14} color="#92400E" />
          <Text style={styles.statusText}>PENDING</Text>
        </View>
      </View>
      
      <View style={styles.cardDetails}>
        {item.address && (
          <View style={styles.detailRow}>
            <Icon name="map-marker" size={14} color="#666" />
            <Text style={styles.detailText}>{item.address}</Text>
          </View>
        )}
        
        {item.description && (
          <View style={styles.detailRow}>
            <Icon name="text" size={14} color="#666" />
            <Text style={styles.detailText} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        )}
        
        <Text style={styles.requestDate}>
          Requested: {item.createdOn ? new Date(item.createdOn).toLocaleDateString() : "N/A"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Guider Requests ({guiders.length})</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Icon name="refresh" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3a0250e3" />
          <Text style={styles.loadingText}>Loading guider requests...</Text>
        </View>
      ) : guiders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="check-circle" size={60} color="#10B981" />
          <Text style={styles.emptyText}>No pending requests</Text>
          <Text style={styles.emptySubtext}>
            All guider requests have been processed
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Icon name="refresh" size={20} color="#42738fe3" />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={guiders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderGuiderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#3a0250e3"]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Action Modal */}
      <Modal
        visible={actionModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setActionModal(false);
          setSelectedGuider(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Process Guider Request</Text>
            
            {selectedGuider && (
              <>
                <View style={styles.modalAvatar}>
                  {selectedGuider.photograph ? (
                    <Image 
                      source={{ uri: selectedGuider.photograph }} 
                      style={styles.modalAvatarImage}
                    />
                  ) : (
                    <Icon name="map-marker-account" size={40} color="#42738fe3" />
                  )}
                </View>
                
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Name:</Text> {selectedGuider.firmName || selectedGuider.name}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Email:</Text> {selectedGuider.email}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.bold}>Phone:</Text> {selectedGuider.phone}
                </Text>
                {selectedGuider.address && (
                  <Text style={styles.modalText}>
                    <Text style={styles.bold}>Address:</Text> {selectedGuider.address}
                  </Text>
                )}
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.rejectButton]}
                onPress={() => handleApproveReject(selectedGuider?.id, "reject")}
              >
                <Icon name="close-circle" size={20} color="#DC2626" />
                <Text style={[styles.buttonText, styles.rejectText]}>Reject</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.approveButton]}
                onPress={() => handleApproveReject(selectedGuider?.id, "approve")}
              >
                <Icon name="check-circle" size={20} color="#059669" />
                <Text style={[styles.buttonText, styles.approveText]}>Approve</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setActionModal(false);
                setSelectedGuider(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#42738fe3",
    borderBottomWidth: 1,
    borderBottomColor: "#42738fe3",
    height: 100,
    marginBottom: 15,
    paddingTop: 35,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#f0e6f7",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0e6f7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  email: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  phone: {
    fontSize: 12,
    color: "#666",
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#FEF3C7",
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#92400E",
    textTransform: "uppercase",
  },
  cardDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  requestDate: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 8,
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0e6f7",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  refreshButtonText: {
    color: "#42738fe3",
    fontWeight: "600",
    fontSize: 14,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0e6f7",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  modalAvatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  modalText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
  },
  bold: {
    fontWeight: "bold",
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  rejectButton: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  approveButton: {
    backgroundColor: "#D1FAE5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  rejectText: {
    color: "#DC2626",
  },
  approveText: {
    color: "#059669",
  },
  cancelButton: {
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    color: "#666",
  },
});