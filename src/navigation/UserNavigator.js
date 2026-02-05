import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import UserHome from "../../screens/User/UserHome";

const Stack = createStackNavigator();

export default function UserNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="UserHome" component={UserHome} />
    </Stack.Navigator>
  );
}
