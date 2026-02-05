import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

// ✅ CORRECT PATHS
import AdminDashboard from "../screens/AdminDashboard";
import UserListScreen from "../screens/Admin/UserListScreen";
import TransactionListScreen from "../screens/Admin/TransactionListScreen";
import GuiderList from "../screens/Admin/GuiderList";
import PlaceList from "../screens/Admin/PlaceList";
import PlaceGallery from "../screens/Admin/PlaceGallery";
import NotificationList from "../screens/Admin/NotificationList";
import CreateNotification from "../screens/Admin/CreateNotification";
import AdminSettings from "../screens/Admin/AdminSettings";
import WithdrawalList from "../screens/Admin/WithdrawalList";
import PhotographerRequests from "../screens/Admin/PhotographerRequests";
import AppointmentList from "../screens/Admin/AppointmentList";
const Stack = createStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboard}
      />

      <Stack.Screen
        name="UserList"
        component={UserListScreen}
        options={{
          headerShown: true,
          title: "Users",
        }}
      />
      <Stack.Screen name="PlaceList" component={PlaceList} />
      <Stack.Screen name="PlaceGallery" component={PlaceGallery} />
      <Stack.Screen name="GuiderList" component={GuiderList} />
      <Stack.Screen
        name="TransactionList"
        component={TransactionListScreen}
        options={{
          headerShown: true,
          title: "Transactions",
        }}
      />
      <Stack.Screen name="NotificationList" component={NotificationList} />
      <Stack.Screen
        name="CreateNotification"
        component={CreateNotification}
        options={{ title: "Create Notification" }}
      />
      <Stack.Screen
        name="AdminSettings"
        component={AdminSettings}
        options={{ title: "Settings" }}
      />
      <Stack.Screen
        name="WithdrawalList"
        component={WithdrawalList}
        options={{ title: "Withdrawals" }}
      />
      <Stack.Screen
        name="PhotographerRequests"
        component={PhotographerRequests}
        options={{ title: "Photographer Requests" }}
      />
      <Stack.Screen
  name="AppointmentList"
  component={AppointmentList}
  options={{ title: "Appointments" }}
/>
    </Stack.Navigator>
  );
}
