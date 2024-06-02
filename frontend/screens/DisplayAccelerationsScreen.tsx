import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { API_URL } from "@env";
import { useFocusEffect } from "@react-navigation/native";
import AccelerationCard from "../components/AccelerationCard"; // Ensure this component is correctly imported


export default function DisplayAccelerationsScreen() {
  const [accelerations, setAccelerations] = useState<Acceleration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);

  const getAccelerations = useCallback(async () => {
    if (!hasMore) return;
    try {
      const response = await axios.get(
        `${API_URL}/accelerations?limit=10&offset=${(page - 1) * 10}`
      );
      setAccelerations((prevAccelerations) => [
        ...prevAccelerations,
        ...response.data,
      ]);
      setHasMore(response.data.length === 10);
    } catch (error) {
      console.error("Error fetching accelerations:", error);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  }, [page, hasMore]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getAccelerations();
    }, [getAccelerations])
  );

  const handleLoadMore = () => {
    if (!isFetchingMore && hasMore) {
      setIsFetchingMore(true);
      setPage((prevPage) => prevPage + 1);
    }
  };

  const renderFooter = () => (
    <View style={styles.loadingContainer}>
      {isFetchingMore && <ActivityIndicator size="large" color="#0000ff" />}
      {hasMore && !isFetchingMore && (
        <Button title="Load More" onPress={handleLoadMore} />
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Accelerations:</Text>
        <FlatList
          data={accelerations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <AccelerationCard acceleration={item} />}
          ListFooterComponent={renderFooter}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
