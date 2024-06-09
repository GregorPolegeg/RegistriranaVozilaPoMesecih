import React from 'react';
import { format } from 'date-fns';
import { View, Text, StyleSheet } from 'react-native';

interface Trip {
    id: number;
    vehicleId: number;
    startTime: string;
    endTime: string;
    distance: number;
  }

const TripCard = ({ trip }: { trip: Trip }) => {
    const formattedDateStart = format(new Date(trip.startTime), 'PPpp');
    const formattedDateEnd = format(new Date(trip.endTime), 'PPpp');
  return (
    <View style={styles.card}>
      <Text style={styles.cardText}>Start Time: {formattedDateStart}</Text>
      <Text style={styles.cardText}>End Time: {formattedDateEnd}</Text>
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
