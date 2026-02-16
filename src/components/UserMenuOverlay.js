import React, { useContext, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Modal,
    Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../context/AuthContext";
import { LocationContext } from "../context/LocationContext";

const { width, height } = Dimensions.get("window");
const BASE_URL = "http://31.97.227.108:8081";

export default function UserMenuOverlay({ visible, onClose, onNavigate }) {
    const { user, refreshUser, logout } = useContext(AuthContext);
    const { location, loading: locationLoading } = useContext(LocationContext);
    const [balance, setBalance] = useState(user?.balance ?? 0);
    const [roleModalVisible, setRoleModalVisible] = useState(false);

    useEffect(() => {
        refreshUser && refreshUser();
    }, []);

    useEffect(() => {
        setBalance(user?.balance ?? 0);
    }, [user?.balance]);

    const userName =
        user?.username ||
        user?.userName ||
        user?.name ||
        user?.fullName ||
        user?.email ||
        "Guest User";

    const profileImage =
        user?.profilePicture || user?.profile
            ? `${BASE_URL}/Uploads/${user?.profilePicture || user?.profile}`
            : null;

    const getLocationText = () => {
        if (locationLoading) return "Detecting location...";
        if (location?.city) {
            return `${location.city}${location.state ? ", " + location.state : ""}`;
        }
        if (location?.error) return "Location unavailable";
        return "Select location";
    };

    if (!visible) return null;

    return (
        <View style={styles.overlay}>
            {/* Semi-transparent background */}
            <TouchableOpacity style={styles.background} activeOpacity={1} onPress={onClose} />
            
            {/* Menu Content */}
            <View style={styles.menuContainer}>
                {/* 🔵 PROFILE HEADER with Gradient */}
                <LinearGradient
                    colors={['#1e3c4f', '#2c5a73', '#3b7a8f']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.profileHeader}
                >
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.avatarCircle}
                        onPress={() => {
                            onClose();
                            onNavigate("ProfileUpdate");
                        }}
                    >
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={styles.avatarImg} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>
                                    {userName.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            onClose();
                            onNavigate("ProfileUpdate");
                        }}
                        style={styles.userInfo}
                    >
                        <Text style={styles.userName}>{userName}</Text>
                        {user?.email && (
                            <Text style={styles.userEmail}>{user.email}</Text>
                        )}
                    </TouchableOpacity>

                    {/* Location Display */}
                    <TouchableOpacity 
                        style={styles.locationContainer}
                        onPress={() => {
                            onClose();
                            onNavigate("LocationSearch");
                        }}
                    >
                        <Ionicons name="location-outline" size={14} color="#fff" />
                        <Text style={styles.locationText} numberOfLines={1}>
                            {getLocationText()}
                        </Text>
                        <Ionicons name="chevron-forward" size={14} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.balanceContainer}>
                        <Ionicons name="wallet-outline" size={16} color="#FFD700" />
                        <Text style={styles.userBalance}>
                            ₹ {balance.toLocaleString()}
                        </Text>
                    </View>
                </LinearGradient>

                {/* 📋 MENU LIST */}
                <View style={styles.menuBox}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <MenuItem 
                            icon="person-outline" 
                            label="Edit Profile" 
                            onPress={() => {
                                onClose();
                                onNavigate("ProfileUpdate");
                            }} 
                        />
                        <MenuItem 
                            icon="home-outline" 
                            label="Home" 
                            onPress={() => {
                                onClose();
                                onNavigate("Home");
                            }} 
                        />
                        <MenuItem 
                            icon="wallet-outline" 
                            label="Add Balance" 
                            onPress={() => {
                                onClose();
                                onNavigate("AddBalance");
                            }} 
                        />
                        <MenuItem 
                            icon="receipt-outline" 
                            label="Transaction History" 
                            onPress={() => {
                                onClose();
                                onNavigate("TransactionHistory");
                            }} 
                        />
                        <MenuItem 
                            icon="calendar-outline" 
                            label="My Bookings" 
                            onPress={() => {
                                onClose();
                                onNavigate("Appointments");
                            }} 
                        />
                        <MenuItem 
                            icon="heart-outline" 
                            label="Wishlist" 
                            onPress={() => {
                                onClose();
                                onNavigate("Wishlist");
                            }} 
                        />
                        <MenuItem 
                            icon="map-outline" 
                            label="Explore Places" 
                            onPress={() => {
                                onClose();
                                onNavigate("ExplorePlace");
                            }} 
                        />
                        <MenuItem 
                            icon="people-outline" 
                            label="Find Tour Guides" 
                            onPress={() => {
                                onClose();
                                onNavigate("Guiders");
                            }} 
                        />
                        <MenuItem 
                            icon="camera-outline" 
                            label="Find Photographers" 
                            onPress={() => {
                                onClose();
                                onNavigate("Photographers");
                            }} 
                        />

                        <View style={styles.divider} />
                        <Text style={styles.sectionTitle}>More</Text>

                        {/* 🔥 Work with Us → Role Selection Modal */}
                        <MenuItem 
                            icon="briefcase-outline" 
                            label="Work with us" 
                            onPress={() => {
                                setRoleModalVisible(true);
                            }} 
                        />

                        <MenuItem 
                            icon="information-circle-outline" 
                            label="About us" 
                            onPress={() => {
                                onClose();
                                onNavigate("AboutUs");
                            }} 
                        />
                        <MenuItem 
                            icon="call-outline" 
                            label="Contact us" 
                            onPress={() => {
                                onClose();
                                onNavigate("ContactUs");
                            }} 
                        />
                        <MenuItem 
                            icon="shield-checkmark-outline" 
                            label="Privacy Policy" 
                            onPress={() => {
                                onClose();
                                onNavigate("PrivacyPolicy");
                            }} 
                        />
                        <MenuItem 
                            icon="document-text-outline" 
                            label="Terms & Conditions" 
                            onPress={() => {
                                onClose();
                                onNavigate("Terms");
                            }} 
                        />
                        <MenuItem 
                            icon="help-circle-outline" 
                            label="Help & Support" 
                            onPress={() => {
                                onClose();
                                onNavigate("Help");
                            }} 
                        />

                        <MenuItem
                            icon="log-out-outline"
                            label="Logout"
                            color="#EF4444"
                            onPress={async () => {
                                await logout();
                                onClose();
                            }}
                        />
                    </ScrollView>
                </View>
            </View>

            {/* Role Selection Modal */}
            <Modal
                visible={roleModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setRoleModalVisible(false)}
            >
                <View style={styles.roleModalOverlay}>
                    <View style={styles.roleModalBox}>
                        <Text style={styles.roleModalTitle}>Join as Partner</Text>
                        <Text style={styles.roleModalSubtitle}>Select your role to get started</Text>

                        <TouchableOpacity
                            style={styles.roleOption}
                            onPress={() => {
                                setRoleModalVisible(false);
                                onClose();
                                onNavigate("GuiderRequestScreen");
                            }}
                        >
                            <View style={[styles.roleIcon, { backgroundColor: '#D1FAE5' }]}>
                                <Ionicons name="people" size={24} color="#10B981" />
                            </View>
                            <View style={styles.roleInfo}>
                                <Text style={styles.roleOptionText}>Tour Guide</Text>
                                <Text style={styles.roleOptionDesc}>Guide tourists to amazing places</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.roleOption}
                            onPress={() => {
                                setRoleModalVisible(false);
                                onClose();
                                onNavigate("PhotographerRequest");
                            }}
                        >
                            <View style={[styles.roleIcon, { backgroundColor: '#FEE2E2' }]}>
                                <Ionicons name="camera" size={24} color="#EF4444" />
                            </View>
                            <View style={styles.roleInfo}>
                                <Text style={styles.roleOptionText}>Photographer</Text>
                                <Text style={styles.roleOptionDesc}>Capture beautiful moments</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.roleCancelBtn}
                            onPress={() => setRoleModalVisible(false)}
                        >
                            <Text style={styles.roleCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

/* MENU ITEM */
function MenuItem({ icon, label, onPress, color = "#1e293b" }) {
    return (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <Ionicons name={icon} size={20} color={color} />
            <Text style={[styles.menuText, { color }]}>{label}</Text>
        </TouchableOpacity>
    );
}

/* 🎨 STYLES */
const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        flexDirection: 'row',
    },
    background: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    menuContainer: {
        width: width * 0.8,
        maxWidth: 300,
        backgroundColor: "#fff",
        height: "100%",
    },
    profileHeader: {
        paddingVertical: 30,
        paddingHorizontal: 16,
        alignItems: "center",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    closeBtn: {
        position: "absolute",
        right: 16,
        top: 16,
        padding: 4,
        zIndex: 10,
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
        overflow: "hidden",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    avatarImg: {
        width: "100%",
        height: "100%",
    },
    avatarPlaceholder: {
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#fff",
    },
    userInfo: {
        alignItems: "center",
        marginBottom: 8,
    },
    userName: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 2,
    },
    userEmail: {
        color: "#E5E7EB",
        fontSize: 12,
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 12,
    },
    locationText: {
        color: "#fff",
        fontSize: 12,
        marginHorizontal: 4,
        maxWidth: 150,
    },
    balanceContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.15)",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    userBalance: {
        color: "#FFD700",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 6,
    },
    menuBox: {
        flex: 1,
        backgroundColor: "#fff",
        paddingVertical: 8,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    menuText: {
        marginLeft: 12,
        fontSize: 14,
        fontWeight: "500",
    },
    divider: {
        height: 1,
        backgroundColor: "#E5E7EB",
        marginVertical: 8,
        marginHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "700",
        marginLeft: 20,
        marginVertical: 6,
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    /* Role Modal Styles */
    roleModalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    roleModalBox: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 24,
        width: "85%",
        maxWidth: 320,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    roleModalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1e293b",
        marginBottom: 4,
        textAlign: "center",
    },
    roleModalSubtitle: {
        fontSize: 14,
        color: "#64748b",
        marginBottom: 24,
        textAlign: "center",
    },
    roleOption: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: "#f8fafc",
        borderRadius: 12,
        marginBottom: 12,
    },
    roleIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    roleInfo: {
        flex: 1,
    },
    roleOptionText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1e293b",
        marginBottom: 2,
    },
    roleOptionDesc: {
        fontSize: 12,
        color: "#64748b",
    },
    roleCancelBtn: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        backgroundColor: "#f1f5f9",
        marginTop: 8,
    },
    roleCancelText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#64748b",
    },
});