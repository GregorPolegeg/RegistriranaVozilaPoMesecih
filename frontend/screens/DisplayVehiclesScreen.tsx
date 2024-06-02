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
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "@env";
import { useFocusEffect } from "@react-navigation/native";
import VehicleCard from "../components/VehicleCard";

export default function DisplayVehiclesScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const navigation = useNavigation();

  const getVehicles = useCallback(async () => {
    if (!hasMore) return;
    try {
      const res = await axios.get(
        `${API_URL}/vehicles?limit=10&offset=${(page - 1) * 10}`
      );
      setVehicles((prevVehicles) => [...prevVehicles, ...res.data]);
      setHasMore(res.data.length === 10); // Assumes the API returns fewer items when there are no more pages
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  }, [page, hasMore]);

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
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Vehicles:</Text>
          <View style={styles.separator} />
          <FlatList
            data={vehicles}
            keyExtractor={(item) => item.vin}
            renderItem={({ item }) => (
              <VehicleCard
                brand={item.brand}
                model={item.model}
                vin={item.vin}
                fuelType={item.fuelType}
                bodyType={item.bodyType}
                onPress={() => null}
              />
            )}
            ListFooterComponent={renderFooter}
          />
        </ScrollView>
      </View>
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
});
