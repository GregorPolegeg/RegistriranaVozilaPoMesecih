import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline, LatLng } from "react-native-maps";
import axios from "axios";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { API_URL } from "@env";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = StackScreenProps<RootStackParamList, "DisplayTripScreen">;

interface Trip {
  startTime: string;
  endTime: string;
  distance: number;
  locations: Array<{ lat: number; lng: number; timestamp: string }>;
}

const DisplayTripScreen: React.FC<Props> = ({ route }) => {
  const { tripId } = route.params;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(API_URL)
    const fetchTripDetails = async () => {
      try {
        const response = await axios.get<Trip>(
          `${API_URL}/trips/trip/${tripId}`
        );
        setTrip(response.data);
      } catch (error) {
        console.error("Error fetching trip details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [tripId]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.container}>
        <Text>No trip data found</Text>
      </View>
    );
  }

  const { startTime, endTime, distance, locations } = trip;

  const coordinates: LatLng[] = locations.map((location) => ({
    latitude: location.lat,
    longitude: location.lng,
  }));

  return (
    
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: coordinates[0].latitude,
            longitude: coordinates[0].longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {coordinates.map((coordinate, index) => (
            <Marker
              key={index}
              coordinate={coordinate}
              title={`Point ${index + 1}`}
              description={`Timestamp: ${new Date(
                locations[index].timestamp
              ).toLocaleString()}`}
            />
          ))}
          <Polyline
            coordinates={coordinates}
            strokeWidth={4}
            strokeColor="blue"
          />
        </MapView>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Start Time: {new Date(startTime).toLocaleString()}
          </Text>
          <Text style={styles.infoText}>
            End Time: {new Date(endTime).toLocaleString()}
          </Text>
          <Text style={styles.infoText}>Distance: {distance} km</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: "white",
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DisplayTripScreen;
