import React from "react";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import HomeScreen from "./HomeScreen";
import DisplayTripsScreen from "./DisplayTripsScreen";
import { useAuth } from "../AuthContext";
import DisplayUserProfileScreen from "./DisplayUserProfileScreen";
import TripTrackingScreen from "./TripTrackingScreen";
import MQTTClient from "./MQTTClient";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";
import DisplayVehiclesScreen from "./DisplayVehiclesScreen";
import { RootStackParamList } from "../types";
import DisplayTripScreen from "./DisplayTripScreen";
import FaceScanScreen from "./FaceScanScreen";
import DisplayUserProfile from "./DisplayUserProfileScreen";
import LoginWithPicture from "./LoginWithPicture";

const Tab = createMaterialBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

function MainTabs() {
  const { isLoggedIn } = useAuth();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      activeColor="#6200ee"
      inactiveColor="#3e2465"
      barStyle={{ backgroundColor: "#ffffff" }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="home-outline"
              color={color}
              size={26}
            />
          ),
        }}
      />
      {isLoggedIn ? (
        <>
          <Tab.Screen
            name="UserProfile"
            component={DisplayUserProfileScreen}
            options={{
              tabBarLabel: "Profile",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons
                  name="account-outline"
                  color={color}
                  size={26}
                />
              ),
            }}
          />
          <Tab.Screen
            name="VehicleList"
            component={DisplayVehiclesScreen}
            options={{
              tabBarLabel: "Vehicles",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons
                  name="car-outline"
                  color={color}
                  size={26}
                />
              ),
            }}
          />
          <Tab.Screen
            name="TripTracker"
            component={TripTrackingScreen}
            options={{
              tabBarLabel: "Track Trip",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons
                  name="map-marker-path"
                  color={color}
                  size={26}
                />
              ),
            }}
          />
          <Tab.Screen
            name="DisplayTrips"
            component={DisplayTripsScreen}
            options={{
              tabBarLabel: "Trips",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons
                  name="map-outline"
                  color={color}
                  size={26}
                />
              ),
            }}
          />
          <Tab.Screen
            name="MQTTClient"
            component={MQTTClient}
            options={{
              tabBarLabel: "MQTT",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons
                  name="network-outline"
                  color={color}
                  size={26}
                />
              ),
            }}
          />
        </>
      ) : (
        <>
          <Tab.Screen
            name="Login"
            component={LoginScreen}
            options={{
              tabBarLabel: "Login",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="login" color={color} size={26} />
              ),
            }}
          />
          <Tab.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              tabBarLabel: "Register",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons
                  name="account-plus-outline"
                  color={color}
                  size={26}
                />
              ),
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
}

export default function TabNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={MainTabs} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="VehicleList" component={DisplayVehiclesScreen} />
      <Stack.Screen name="FaceScan" component={FaceScanScreen} />
      <Stack.Screen name="UserProfile" component={DisplayUserProfile} />
      <Stack.Screen name="LoginWithPicture" component={LoginWithPicture} />
      <Stack.Screen name="TripTracker" component={TripTrackingScreen} />
      <Stack.Screen name="DisplayTripScreen" component={DisplayTripScreen} />
      <Stack.Screen name="DisplayTripsScreen" component={DisplayTripsScreen} />
      <Stack.Screen name="MQTTClient" component={MQTTClient} />
    </Stack.Navigator>
  );
}
