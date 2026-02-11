import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthContext } from "../context/AuthContext";
import { IS_ADMIN_APP } from "../appMode";

/* 🔐 AUTH */
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

/* 👤 USER */
import UserDashboard from "../screens/UserDashboard";
import UserMenuScreen from "../screens/UserMenuScreen";
import UserProfileScreen from "../screens/User/UserProfileScreen";
import UserEditProfileScreen from "../screens/User/userEditProfileScreen";
import ProfileUpdateScreen from "../screens/User/ProfileUpdateScreen";
import ProfilePictureScreen from "../screens/User/ProfilePictureScreen";
import AddBalanceScreen from "../screens/User/AddBalanceScreen";
import ContactUsScreen from "../screens/User/ContactUsScreen";

/* 📍 LOCATION */
import LocationPicker from "../screens/User/LocationPicker";
import LocationSearchScreen from "../screens/User/LocationSearchScreen";
import MapSelectScreen from "../screens/User/MapSelectScreen";

/* 📸 PHOTOGRAPHERS */
import PhotographersListScreen from "../screens/User/PhotographersListScreen";

/* 🎭 ROLES */
import RoleRequestScreen from "../screens/RoleRequestScreen";
import GuiderDashboard from "../screens/GuiderDashboard";
import PhotographerDashboard from "../screens/PhotographerDashboard";

/* 👑 ADMIN */
import AdminStack from "./AdminStack";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* 🔐 AUTH FLOW */}
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            {!IS_ADMIN_APP && (
              <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
            )}
          </>
        ) : IS_ADMIN_APP ? (
          // 👑 Admin APK → always AdminStack
          <Stack.Screen name="Admin" component={AdminStack} />
        ) : user.role === "ADMIN" ? (
          // 👑 User APK but role = ADMIN
          <Stack.Screen name="Admin" component={AdminStack} />
        ) : user.role === "GUIDER" ? (
          // 🧭 Guider role
          <Stack.Screen name="GuiderDashboard" component={GuiderDashboard} />
        ) : user.role === "PHOTOGRAPHER" ? (
          // 📸 Photographer role
          <Stack.Screen
            name="PhotographerDashboard"
            component={PhotographerDashboard}
          />
        ) : (
          // 👤 Normal User (can send role request)
          <>
            <Stack.Screen name="UserDashboard" component={UserDashboard} />

            {/* 👤 PROFILE */}
            <Stack.Screen name="UserMenu" component={UserMenuScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen
              name="UserEditProfile"
              component={UserEditProfileScreen}
            />
            <Stack.Screen
              name="ProfileUpdate"
              component={ProfileUpdateScreen}
            />
            <Stack.Screen
              name="ProfilePicture"
              component={ProfilePictureScreen}
            />

            {/* 💰 WALLET */}
            <Stack.Screen name="AddBalance" component={AddBalanceScreen} />

            {/* 🎭 ROLE REQUEST */}
            <Stack.Screen name="RoleRequest" component={RoleRequestScreen} />

            {/* ☎️ CONTACT */}
            <Stack.Screen name="ContactUs" component={ContactUsScreen} />

            {/* 📍 LOCATION FLOW */}
            <Stack.Screen name="LocationPicker" component={LocationPicker} />
            <Stack.Screen
              name="LocationSearch"
              component={LocationSearchScreen}
            />
            <Stack.Screen name="MapSelect" component={MapSelectScreen} />

            {/* 📸 PHOTOGRAPHERS LIST */}
            <Stack.Screen
              name="PhotographersList"
              component={PhotographersListScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
