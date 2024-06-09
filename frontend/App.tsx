import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./AuthContext";
import TabNavigator from "./screens/TabNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import registerBackgroundTask from "./service/BackgroundTask";


export default function App() {
  useEffect(() => {
    registerBackgroundTask();
  }, []);

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
