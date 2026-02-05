import React, { createContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";

export const AuthContext = createContext();

/* 🔥 SINGLE SOURCE OF TRUTH */
const normalizeUser = (data) => {
  if (!data) return null;

  const base = data.user ? data.user : data;

  const isAdmin = base.admin === true;
  const isGuider = base.guider === true;
  const isPhotographer = base.photographer === true;

  return {
    // basic info
    id: base.id,
    name: base.name || base.username || "User",
    username: base.username,
    phone: base.phone,
    email: base.email,
    address: base.address,
    gender: base.gender,
    dob: base.dob,
    countryCode: base.countryCode,
    latitude: base.latitude,
    longitude: base.longitude,
    profile: base.profile,

    // 🔥 backend flags (VERY IMPORTANT)
    admin: isAdmin,
    guider: isGuider,
    photographer: isPhotographer,

    // 🔥 derived role
    isAdmin: isAdmin,
    role: isAdmin
      ? "ADMIN"
      : isGuider
      ? "GUIDER"
      : isPhotographer
      ? "PHOTOGRAPHER"
      : "USER",

    // tokens
    token: data.token || base.token,
    refreshToken: data.refreshToken,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  /* ✅ LOGIN */
  const login = async (loginResponse) => {
    const normalized = normalizeUser(loginResponse);
    setUser(normalized);

    if (normalized?.token) {
      await AsyncStorage.setItem("token", normalized.token);
    }
  };

  /* ✅ REFRESH PROFILE (OPTIONAL) */
  const refreshUser = async () => {
    try {
      const res = await api.post("/user/get_profile", {});
      if (res?.data?.status === true && res.data.data) {
        setUser((prev) =>
          normalizeUser({
            ...prev,
            ...res.data.data,
          })
        );
      }
    } catch {
      console.log("refreshUser skipped");
    }
  };

  /* ✅ UPDATE PROFILE (LOCAL SAFE UPDATE) */
  const updateProfile = async (payload) => {
    const res = await api.post("/user/update_profile", payload);

    if (res?.data?.status === true) {
      setUser((prev) =>
        normalizeUser({
          ...prev,
          ...payload,
        })
      );
    }

    return res.data;
  };

  /* ✅ LOGOUT */
  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, refreshUser, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
