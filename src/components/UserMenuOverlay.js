import React, { useContext, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";

const BASE_URL = "https://YOUR_BASE_URL";

export default function UserMenuOverlay({ onClose, onNavigate }) {
    const { user, refreshUser, logout } = useContext(AuthContext);
    const [balance, setBalance] = useState(user?.balance ?? 0);

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
                {/* 🔙 BACK */}
                <TouchableOpacity style={styles.backBtn} onPress={onClose}>
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>

                {/* 👤 AVATAR → PROFILE PICTURE UPDATE */}
                <TouchableOpacity
                    style={styles.avatarCircle}
                    onPress={() => {
                        onClose();
                        onNavigate("UserProfile"); // 🔥 ONLY THIS
                    }}
                >

                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.avatarImg} />
                    ) : (
                        <Ionicons name="person" size={36} color="#fff" />
                    )}
                </TouchableOpacity>

                {/* 👤 NAME / EMAIL → PROFILE UPDATE */}
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

                    <MenuItem icon="briefcase-outline" label="Work with us" onPress={() => onNavigate("WorkWithUs")} />
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

/* 🎨 STYLES — SAME AS BEFORE (UNCHANGED) */
const styles = StyleSheet.create({
    overlay: { position: "absolute", top: 0, left: -20, right: 137, zIndex: 999 },
    profileHeader: {
        backgroundColor: "#2563EB",
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
});
