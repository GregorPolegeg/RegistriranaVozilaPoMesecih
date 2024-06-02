// VehicleCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface VehicleCardProps {
  brand: string;
  model: string;
  vin: string;
  fuelType: string;
  bodyType: string;
  onPress: () => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ brand, model, vin, fuelType, bodyType, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{brand}</Text>
      <View style={styles.divider} />
      <View>
        <Text style={styles.text}><Text style={styles.label}>Model:</Text> {model}</Text>
        <Text style={styles.text}><Text style={styles.label}>VIN:</Text> {vin}</Text>
        <Text style={styles.text}><Text style={styles.label}>Fuel Type:</Text> {fuelType}</Text>
        <Text style={styles.text}><Text style={styles.label}>Body Type:</Text> {bodyType}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 8,
  },
  text: {
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
  },
});

export default VehicleCard;
