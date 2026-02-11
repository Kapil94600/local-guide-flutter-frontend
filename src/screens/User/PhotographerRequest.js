import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import api from "../../api/apiClient";

export default function PhotographerRequests({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch photographer requests (IN_REVIEW status)
  const fetchPhotographerRequests = async () => {
    try {
      const response = await api.post("/api/photographers/get_all", {
        status: "IN_REVIEW",
        admin: true,
      });
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        setRequests(response.data.data);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error("Error fetching photographer requests:", error);
      Alert.alert("Error", "Failed to load requests");
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPhotographerRequests();
    
    // Refresh when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPhotographerRequests();
    });
    
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPhotographerRequests();
  };

  // Handle Approve/Decline
  const handleRespond = async (photographerId, status) => {
    setActionLoading(photographerId);
    
    try {
      const response = await api.post(
        "/api/photographers/respond_on_request",
        new URLSearchParams({
          photographerId: photographerId,
          status: status,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data?.status) {
        Alert.alert(
          "Success", 
          `Request ${status === "APPROVED" ? "approved" : "declined"} successfully`
        );
        // Remove from list
        setRequests(prev => prev.filter(req => req.id !== photographerId));
      } else {
        Alert.alert("Error", response.data?.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Update status error:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle active status
  const toggleActive = async (photographerId, currentActive) => {
    try {
      const response = await api.post(
        "/api/photographers/change_active_status",
        new URLSearchParams({
          pId: photographerId,
          active: !currentActive ? "1" : "0",
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data?.status) {
        // Update local state
        setRequests(prev => prev.map(req => 
          req.id === photographerId 
            ? { ...req, active: !currentActive }
            : req
        ));
        Alert.alert("Success", "Status updated successfully");
      } else {
        Alert.alert("Error", response.data?.message || "Failed to update");
      }
    } catch (error) {
      console.error("Toggle active error:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  const showConfirmDialog = (item, action) => {
    Alert.alert(
      `Confirm ${action}`,
      `Are you sure you want to ${action.toLowerCase()} ${item.firmName || item.userName}'s request?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: () => handleRespond(item.id, action === "Approve" ? "APPROVED" : "DECLINED"),
        },
      ]
    );
  };

  const viewDetails = (item) => {
    setSelectedRequest(item);
    setModalVisible(true);
  };

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestCard}>
      {/* Header */}
      <TouchableOpacity onPress={() => viewDetails(item)}>
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              {item.profileImage ? (
                <Icon name="account" size={24} color="#42738f" />
              ) : (
                <Icon name="camera" size={24} color="#42738f" />
              )}
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{item.firmName || item.name || "Unnamed"}</Text>
              <Text style={styles.userId}>ID: {item.id}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { 
            backgroundColor: item.status === "APPROVED" ? "#D1FAE5" : 
                           item.status === "DECLINED" ? "#FEE2E2" : "#FEF3C7" 
          }]}>
            <Text style={[styles.statusText, { 
              color: item.status === "APPROVED" ? "#065F46" : 
                     item.status === "DECLINED" ? "#991B1B" : "#92400E" 
            }]}>
              {item.status || "PENDING"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Quick Info */}
      <View style={styles.quickInfo}>
        {item.email && (
          <View style={styles.infoRow}>
            <Icon name="email" size={14} color="#666" />
            <Text style={styles.infoText} numberOfLines={1}>{item.email}</Text>
          </View>
        )}
        {item.phone && (
          <View style={styles.infoRow}>
            <Icon name="phone" size={14} color="#666" />
            <Text style={styles.infoText}>{item.phone}</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.cardFooter}>
        {item.status === "IN_REVIEW" || item.status === "PENDING" ? (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => showConfirmDialog(item, "Approve")}
              disabled={actionLoading === item.id}
            >
              {actionLoading === item.id ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="check-circle" size={18} color="#fff" />
                  <Text style={styles.actionButtonText}>Approve</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => showConfirmDialog(item, "Decline")}
              disabled={actionLoading === item.id}
            >
              {actionLoading === item.id ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="close-circle" size={18} color="#fff" />
                  <Text style={styles.actionButtonText}>Decline</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.activeToggle}>
            <Text style={styles.activeLabel}>Active: </Text>
            <TouchableOpacity
              style={[styles.toggleButton, item.active ? styles.activeToggleBtn : styles.inactiveToggleBtn]}
              onPress={() => toggleActive(item.id, item.active)}
            >
              <Text style={styles.toggleText}>
                {item.active ? "YES" : "NO"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#42738f" />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photographer Requests</Text>
        <View style={styles.headerRight}>
          <Text style={styles.countBadge}>{requests.length} Total</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <Icon name="refresh" size={20} color="#42738f" />
          </TouchableOpacity>
        </View>
      </View>

      {requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="check-circle" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>No photographer requests</Text>
          <Text style={styles.emptySubtext}>
            All photographer applications have been reviewed
          </Text>
          <TouchableOpacity
            style={styles.refreshLargeButton}
            onPress={onRefresh}
          >
            <Icon name="refresh" size={20} color="#42738f" />
            <Text style={styles.refreshLargeText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRequestItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#42738f"]}
              tintColor="#42738f"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedRequest && (
                <>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Firm Name</Text>
                    <Text style={styles.detailValue}>{selectedRequest.firmName || "N/A"}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Owner Name</Text>
                    <Text style={styles.detailValue}>{selectedRequest.name || "N/A"}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Email</Text>
                    <Text style={styles.detailValue}>{selectedRequest.email || "N/A"}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Phone</Text>
                    <Text style={styles.detailValue}>{selectedRequest.phone || "N/A"}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>{selectedRequest.address || "N/A"}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Description</Text>
                    <Text style={styles.detailValue}>{selectedRequest.description || "N/A"}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <View style={[styles.statusBadge, { 
                      backgroundColor: selectedRequest.status === "APPROVED" ? "#D1FAE5" : 
                                     selectedRequest.status === "DECLINED" ? "#FEE2E2" : "#FEF3C7" 
                    }]}>
                      <Text style={[styles.statusText, { 
                        color: selectedRequest.status === "APPROVED" ? "#065F46" : 
                               selectedRequest.status === "DECLINED" ? "#991B1B" : "#92400E" 
                      }]}>
                        {selectedRequest.status || "PENDING"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Created At</Text>
                    <Text style={styles.detailValue}>
                      {selectedRequest.created_at ? 
                        new Date(selectedRequest.created_at).toLocaleString() : 
                        "N/A"}
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              {selectedRequest?.status === "IN_REVIEW" && (
                <>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalApproveButton]}
                    onPress={() => {
                      setModalVisible(false);
                      showConfirmDialog(selectedRequest, "Approve");
                    }}
                  >
                    <Icon name="check-circle" size={20} color="#fff" />
                    <Text style={styles.modalButtonText}>Approve</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalDeclineButton]}
                    onPress={() => {
                      setModalVisible(false);
                      showConfirmDialog(selectedRequest, "Decline");
                    }}
                  >
                    <Icon name="close-circle" size={20} color="#fff" />
                    <Text style={styles.modalButtonText}>Decline</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCloseButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: "#42738f" }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Keep the same styles as before, just change icon references if needed