import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./screens/HomeScreen";
import { RootStackParamList } from "./types";
import { AuthProvider, useAuth } from "./AuthContext";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import DisplayVehiclesScreen from "./screens/DisplayVehiclesScreen";
import FaceScanScreen from "./screens/FaceScanScreen";
import { SafeAreaView } from "react-native";
import LoginWithPicture from "./screens/LoginWithPicture";
import DisplayUserProfile from "./screens/DisplayUserProfileScreen";

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="VehicleList" component={DisplayVehiclesScreen} />
      <Stack.Screen name="FaceScan" component={FaceScanScreen} />
      <Stack.Screen name="UserProfile" component={DisplayUserProfile} />
      <Stack.Screen name="LoginWithPicture" component={LoginWithPicture} />
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <SafeAreaView style={{flex:1}}>
          <AppNavigator />
        </SafeAreaView>
      </NavigationContainer>
    </AuthProvider>
  );
}
