import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Button, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import { useFocusEffect } from '@react-navigation/native';
import TripCard from '../components/TripCard'; // Ensure you have this component


export default function DisplayTripsScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);

  const getTrips = useCallback(async () => {
    if (!hasMore) return;
    try {
      const response = await axios.get(`${API_URL}/trips?limit=10&offset=${(page - 1) * 10}`);
      setTrips((prevTrips) => [...prevTrips, ...response.data]);
      setHasMore(response.data.length === 10);
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  }, [page, hasMore]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getTrips();
    }, [getTrips])
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
      {hasMore && !isFetchingMore && <Button title="Load More" onPress={handleLoadMore} />}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Trips:</Text>
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <TripCard trip={item} />}
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
