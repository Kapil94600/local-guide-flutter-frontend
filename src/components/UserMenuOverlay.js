import React, { useContext, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";

const BASE_URL = "https://YOUR_BASE_URL";

export default function UserMenuOverlay({ onClose, onNavigate }) {
    const { user, refreshUser, logout } = useContext(AuthContext);
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
        "";

    const profileImage =
        user?.profilePicture
            ? `${BASE_URL}/Uploads/${user.profilePicture}`
            : null;

    return (
        <View style={styles.overlay}>
            {/* 🔵 PROFILE HEADER */}
            <View style={styles.profileHeader}>
                <TouchableOpacity style={styles.backBtn} onPress={onClose}>
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.avatarCircle}
                    onPress={() => {
                        onClose();
                        onNavigate("UserProfile");
                    }}
                >
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.avatarImg} />
                    ) : (
                        <Ionicons name="person" size={36} color="#fff" />
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        onClose();
                        onNavigate("ProfileUpdate");
                    }}
                >
                    <Text style={styles.userName}>{userName}</Text>
                    {user?.email && (
                        <Text style={styles.userEmail}>{user.email}</Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.userBalance}>
                    Balance: ₹ {balance}
                </Text>
            </View>

            {/* 📋 MENU LIST */}
            <View style={styles.menuBox}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <MenuItem icon="person-outline" label="Edit Profile" onPress={() => onNavigate("ProfileUpdate")} />
                    <MenuItem icon="home-outline" label="Home" onPress={() => onNavigate("Home")} />
                    <MenuItem icon="wallet-outline" label="Add Balance" onPress={() => onNavigate("AddBalance")} />
                    <MenuItem icon="receipt-outline" label="Transaction History" onPress={() => onNavigate("TransactionHistory")} />
                    <MenuItem icon="calendar-outline" label="Appointments" onPress={() => onNavigate("Appointments")} />
                    <MenuItem icon="heart-outline" label="Your Wishlist" onPress={() => onNavigate("Wishlist")} />
                    <MenuItem icon="map-outline" label="Explore Place" onPress={() => onNavigate("ExplorePlace")} />
                    <MenuItem icon="people-outline" label="Find Tourist Guiders" onPress={() => onNavigate("Guiders")} />
                    <MenuItem icon="camera-outline" label="Find Photographers" onPress={() => onNavigate("Photographers")} />

                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Other</Text>

                    {/* 🔥 Work with Us → Role Selection Modal */}
                    <MenuItem 
                        icon="briefcase-outline" 
                        label="Work with us" 
                        onPress={() => setRoleModalVisible(true)} 
                    />

                    <MenuItem icon="information-circle-outline" label="About us" onPress={() => onNavigate("AboutUs")} />
                    <MenuItem icon="call-outline" label="Contact us" onPress={() => onNavigate("ContactUs")} />
                    <MenuItem icon="shield-checkmark-outline" label="Privacy & Policy" onPress={() => onNavigate("PrivacyPolicy")} />
                    <MenuItem icon="document-text-outline" label="Terms & Conditions" onPress={() => onNavigate("Terms")} />
                    <MenuItem icon="help-circle-outline" label="Help" onPress={() => onNavigate("Help")} />

                    <MenuItem
                        icon="log-out-outline"
                        label="Logout"
                        color="red"
                        onPress={async () => {
                            await logout();
                            onClose();
                        }}
                    />
                </ScrollView>
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
                        <Text style={styles.roleModalTitle}>Select Role</Text>

                        <TouchableOpacity
                            style={styles.roleOption}
                            onPress={() => {
                                setRoleModalVisible(false);
                                onClose();
                                onNavigate("GuiderRequestScreen"); // ✅ must be registered in navigator
                            }}
                        >
                            <Ionicons name="people-outline" size={22} color="#10B981" />
                            <Text style={styles.roleOptionText}>Guider</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.roleOption}
                            onPress={() => {
                                setRoleModalVisible(false);
                                onClose();
                                onNavigate("PhotographerRequestScreen"); // ✅ must be registered in navigator
                            }}
                        >
                            <Ionicons name="camera-outline" size={22} color="#F59E0B" />
                            <Text style={styles.roleOptionText}>Photographer</Text>
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
function MenuItem({ icon, label, onPress, color = "#111" }) {
    return (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <Ionicons name={icon} size={20} color={color} />
            <Text style={[styles.menuText, { color }]}>{label}</Text>
        </TouchableOpacity>
    );
}

/* 🎨 STYLES */
const styles = StyleSheet.create({
    overlay: { position: "absolute", top: 0, left: -20, right: 137, zIndex: 999 },
    profileHeader: {
        backgroundColor: "#42738fe3",
        paddingVertical: 22,
        paddingHorizontal: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        alignItems: "center",
        width: 260,
    },
    backBtn: { position: "absolute", left: 24, top: 34 },
    avatarCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
        overflow: "hidden",
    },
    avatarImg: { width: "100%", height: "100%" },
    userName: { color: "#fff", fontSize: 16, fontWeight: "700" },
    userEmail: { color: "#E5E7EB", fontSize: 12, marginTop: 2 },
    userBalance: { color: "#FACC15", fontSize: 13, marginTop: 6, fontWeight: "600" },
    menuBox: { backgroundColor: "#fff", marginHorizontal: 16, elevation: 8, paddingVertical: 6, maxHeight: 705 },
    menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16 },
    menuText: { marginLeft: 12, fontSize: 14, fontWeight: "600" },
    divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 8, marginHorizontal: 12 },
    sectionTitle: { fontSize: 13, fontWeight: "700", marginLeft: 16, marginVertical: 6, color: "#374151" },

    /* Role Modal Styles */
    roleModalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    roleModalBox: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        width: 250,
        alignItems: "center",
    },
    roleModalTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 16,
    },
    roleOption: {
        flexDirection: "row",

        alignItems: "center",
        paddingVertical: 12,
    },
    roleOptionText: {
        marginLeft: 10,
        fontSize: 15,
        fontWeight: "600",
    },

});
