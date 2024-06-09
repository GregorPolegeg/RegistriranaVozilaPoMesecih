import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { API_URL } from "@env";
import { SafeAreaView } from "react-native-safe-area-context";

const TripTrackingScreen = () => {
  const [tripId, setTripId] = useState<number | null>(null);
  const { token, userId } = useAuth();
  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log(API_URL)
    const fetchVehicles = async () => {
      try {
        const response = await axios.get(`${API_URL}/vehicles/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVehicles(response.data);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [token]);

  const startTrip = async () => {
    try {
      if (vehicleId === null) {
        Alert.alert("No vehicle selected");
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }

      const response = await axios.post(`${API_URL}/trips/start`, {
        vehicleId,
      });

      if (response.data && response.data.tripId) {
        setTripId(response.data.tripId);
        Alert.alert("Trip started", `Trip ID: ${response.data.tripId}`);

        const id = setInterval(async () => {
          const location = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = location.coords;
          await axios.post(
            `${API_URL}/trips/updateLocation`,
            {
              tripId: response.data.tripId,
              lat: latitude,
              lng: longitude,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        }, 30000);
      }
    } catch (error) {
      console.error("Error starting trip:", error);
    }
  };

  const stopTrip = async () => {
    try {
      if (tripId) {
        await axios.post(`${API_URL}/trips/finish`, { tripId });
        setTripId(null);
        Alert.alert("Trip stopped");
      }
    } catch (error) {
      console.error("Error stopping trip:", error);
    }
  };

  const renderVehicle = ({ item }: { item: Vehicle }) => (
    <TouchableOpacity onPress={() => setVehicleId(item.id)}>
      <View style={styles.vehicleCard}>
        <Text style={styles.vehicleText}>
          {item.brand} {item.model}
        </Text>
        <Text style={styles.vehicleText}>
          {item.fuelType} - {item.bodyType}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{flex:1}}>
      <View style={styles.container}>
        {loading ? (
          <Text>Loading vehicles...</Text>
        ) : vehicleId === null ? (
          <FlatList
            data={vehicles}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderVehicle}
          />
        ) : (
          <>
            <Text style={styles.title}>Trip Tracker</Text>
            <Button
              title="Start Trip"
              onPress={startTrip}
              disabled={!!tripId}
            />
            <Button title="Stop Trip" onPress={stopTrip} disabled={!tripId} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
  },
  vehicleCard: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#ddd",
    borderRadius: 5,
  },
  vehicleText: {
    fontSize: 16,
  },
});

export default TripTrackingScreen;
