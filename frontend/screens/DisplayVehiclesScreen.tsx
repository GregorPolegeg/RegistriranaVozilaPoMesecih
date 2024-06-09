import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Button,
  ScrollView,
  SafeAreaView,
  Modal,
  TouchableOpacity,
  TextInput,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "@env";
import { useFocusEffect } from "@react-navigation/native";
import VehicleCard from "../components/VehicleCard";
import { useAuth } from "../AuthContext";

export default function DisplayVehiclesScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { token,addVehicle } = useAuth();
  const navigation = useNavigation();

  const getVehicles = useCallback(async () => {
    console.log(API_URL)
    if (!hasMore) return;
    try {
      console.log(page);
      const res = await axios.get(
        `${API_URL}/vehicles?limit=10&offset=${(page - 1) * 20}&search=${searchQuery}`
      );
      setVehicles((prevVehicles) => [...prevVehicles, ...res.data]);
      setHasMore(res.data.length === 10);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  }, [page, hasMore, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getVehicles();
    }, [getVehicles])
  );

  const handleLoadMore = () => {
    setIsFetchingMore(true);
    setPage((prevPage) => prevPage + 1);
  };

  const handleLongPress = (vehicle: Vehicle) => {
    addVehicle(vehicle.id);
    setSelectedVehicle(vehicle);
    setModalVisible(true);
  };

  const handleConfirmOwnership = async () => {
    if (selectedVehicle && token) {
      try {
        await axios.post(
          `${API_URL}/users/addvehicle`,
          { vehicleId: selectedVehicle.id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setModalVisible(false);
        alert("Vehicle ownership confirmed!");
      } catch (error) {
        console.error("Error confirming vehicle ownership:", error);
        alert("Failed to confirm vehicle ownership.");
      }
    }
  };

  useEffect(() => {
    const filtered = vehicles.filter((vehicle) =>
      vehicle.vin.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredVehicles(filtered);
  }, [searchQuery, vehicles]);

  const renderFooter = () => {
    return (
      <View style={styles.loadingContainer}>
        {isFetchingMore && <ActivityIndicator size="large" color="#0000ff" />}
        {hasMore && !isFetchingMore && (
          <Button title="Load More" onPress={handleLoadMore} />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search by VIN"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            setPage(1);
            setVehicles([]);
            setLoading(true);
            setHasMore(true);
          }}
        />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Vehicles:</Text>
          <View style={styles.separator} />
          <FlatList
            data={filteredVehicles}
            keyExtractor={(item) => item.vin}
            renderItem={({ item }) => (
              <VehicleCard
                brand={item.brand}
                model={item.model}
                vin={item.vin}
                fuelType={item.fuelType}
                bodyType={item.bodyType}
                onPress={() => null}
                onLongPress={() => handleLongPress(item)}
              />
            )}
            ListFooterComponent={renderFooter}
          />
        </ScrollView>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Is this vehicle yours?</Text>
          <View style={styles.buttonContainer}>
            <Button title="Yes" onPress={handleConfirmOwnership} />
            <Button title="No" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  searchBar: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
    marginTop: 8,
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 16,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  modalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    color: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "60%",
  },
});
