import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { Card } from '@rneui/themed';
import config from '../config';

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  vin: string;
  fuelType: string;
  bodyType: string;
}

const DisplayVehiclesScreen: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/vehicles/list?limit=10&offset=20`); // Replace with your API URL
        const data = await response.json();
        const formattedData = data.map((vehicle: Vehicle) => ({
          id: vehicle.id,
          brand: vehicle.brand,
          model: vehicle.model,
          vin: vehicle.vin,
          fuelType: vehicle.fuelType,
          bodyType: vehicle.bodyType,
        }));
        setVehicles(formattedData);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      {vehicles.map((item) => (
        <Card key={item.vin} containerStyle={styles.card}>
          <Card.Title>{item.brand}</Card.Title>
          <Card.Divider />
          <View>
            <Text style={styles.text}><Text style={styles.label}>Model:</Text> {item.model}</Text>
            <Text style={styles.text}><Text style={styles.label}>VIN:</Text> {item.vin}</Text>
            <Text style={styles.text}><Text style={styles.label}>Fuel Type:</Text> {item.fuelType}</Text>
            <Text style={styles.text}><Text style={styles.label}>Body Type:</Text> {item.bodyType}</Text>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 8,
    marginVertical: 10,
    padding: 10,
  },
  text: {
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
  },
});

export default DisplayVehiclesScreen;
