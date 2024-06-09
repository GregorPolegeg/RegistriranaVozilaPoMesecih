import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { API_URL } from "@env";
import VehicleCard from "../components/VehicleCard";
import TripCard from "../components/TripCard";
import AccelerationCard from "../components/AccelerationCard";
import { useAuth } from "../AuthContext";

const DisplayUserProfile = () => {
  const [profile, setProfile] = useState<Profile>();
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    console.log(API_URL)
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/users/profile`, 
        {
          headers: { authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
  if (!profile) {
    return null;
  } else {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          {profile.firstName} {profile.lastName}  {profile.email} 
        </Text>
        <FlatList
          data={profile.vehicles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View>
              <VehicleCard
                brand={item.brand}
                model={item.model}
                vin={item.vin}
                fuelType={item.fuelType}
                bodyType={item.bodyType}
                onPress={() => null}
              />
              <Text style={styles.subtitle}>Trips:</Text>
              <FlatList
                data={item.trips}
                keyExtractor={(trip) => trip.id.toString()}
                renderItem={({ item: tripItem }) => (
                  <TripCard trip={tripItem} />
                )}
              />
              <Text style={styles.subtitle}>Accelerations:</Text>
              <FlatList
                data={item.accelerations}
                keyExtractor={(acc) => acc.id.toString()}
                renderItem={({ item: accItem }) => (
                  <AccelerationCard acceleration={accItem} />
                )}
              />
            </View>
          )}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    marginBottom: 5,
  },
});

export default DisplayUserProfile;