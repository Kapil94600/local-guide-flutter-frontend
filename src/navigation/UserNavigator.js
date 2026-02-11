import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import UserHome from "../../screens/User/UserHome";
import GuiderRequestScreen from "../../screens/User/GuiderRequestScreen";       // 👈 add this
import PhotographerRequestScreen from "../../screens/User/PhotographerRequestScreen"; // 👈 add this

const Stack = createStackNavigator();

export default function UserNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="UserHome" component={UserHome} />
      <Stack.Screen 
        name="GuiderRequestScreen" 
        component={GuiderRequestScreen} 
        options={{ title: "Guider Request" }}
      />
      <Stack.Screen 
        name="PhotographerRequestScreen" 
        component={PhotographerRequestScreen} 
        options={{ title: "Photographer Request" }}
      />
    </Stack.Navigator>
  );
}
