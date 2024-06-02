import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Trip {
    id: number;
    vehicleId: number;
    startTime: string;
    endTime: string;
    distance: number;
  }
  
const TripCard = ({ trip }: { trip: Trip }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardText}>Start Time: {trip.startTime}</Text>
      <Text style={styles.cardText}>End Time: {trip.endTime}</Text>
      <Text style={styles.cardText}>Distance: {trip.distance.toFixed(2)} km</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
    color: '#333',
  },
});

export default TripCard;
