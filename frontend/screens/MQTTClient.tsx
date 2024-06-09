import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, TextInput, ScrollView, StyleSheet } from 'react-native';
import { Client, Message } from 'react-native-paho-mqtt';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { KOMAR } from '@env';
import { useAuth } from '../AuthContext';

// Set up an in-memory alternative to global localStorage
const myStorage = {
  setItem: (key: string, item: string) => {
    AsyncStorage.setItem(key, item);
  },
  getItem: async (key: string) => {
    const value = await AsyncStorage.getItem(key);
    return value;
  },
  removeItem: (key: string) => {
    AsyncStorage.removeItem(key);
  },
};

const getProximityTopic = (latitude: number, longitude: number) => {
  // Define a function to generate a topic based on the location
  // For example, use the first two decimal places to create proximity groups
  return `nearby/users/${latitude.toFixed(2)}/${longitude.toFixed(2)}`;
};

const MQTTClient: React.FC = () => {
  const [client, setClient] = useState<Client | null>(null);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ userId: string, message: string, timestamp: Date }[]>([]);
  const {userId} = useAuth();

  useEffect(() => {
    (async () => {

      const mqttClient = new Client({
        uri: `ws://${KOMAR}:1883/mqtt`,
        clientId: userId ? userId : 'id',
        storage: myStorage,
      });
      setClient(mqttClient);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const proximityTopic = getProximityTopic(location.coords.latitude, location.coords.longitude);

      // Connect the client
      mqttClient.connect()
        .then(() => {
          setIsConnected(true);
          console.log('Connected to MQTT broker');
          return mqttClient.subscribe(proximityTopic);
        })
        .then(() => {
          console.log(`Subscribed to ${proximityTopic}`);
        })
        .catch(err => {
          console.error('Connection failed', err);
        });

      mqttClient.on('messageReceived', (message: Message) => {
        const parsedMessage = JSON.parse(message.payloadString);
        console.log(`Message received: ${message.payloadString}`);
        setMessages(prevMessages => [...prevMessages, parsedMessage]);
      });

      mqttClient.on('connectionLost', (responseObject: { errorCode: number; errorMessage: string }) => {
        if (responseObject.errorCode !== 0) {
          console.log('Connection lost: ' + responseObject.errorMessage);
          setIsConnected(false);
        }
      });

      // Cleanup function to disconnect the client
      return () => {
        mqttClient.disconnect();
      };
    })();
  }, []);

  const sendMessage = async () => {
    console.log(userId);
    if (message && client && userId && location) {
      const proximityTopic = getProximityTopic(location.latitude, location.longitude);
      const mqttMessage = new Message(JSON.stringify({ userId, message, timestamp: new Date() }));
      mqttMessage.destinationName = proximityTopic;
      client.send(mqttMessage);
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <Text>MQTT Client Running</Text>
      {location && (
        <Text>Location: {location.latitude}, {location.longitude}</Text>
      )}
      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <View key={index} style={styles.message}>
            <Text style={styles.messageUser}>{msg.userId}</Text>
            <Text style={styles.messageText}>{msg.message}</Text>
            <Text style={styles.messageTimestamp}>{new Date(msg.timestamp).toLocaleTimeString()}</Text>
          </View>
        ))}
      </ScrollView>
      <TextInput
        placeholder="Type a message"
        value={message}
        onChangeText={setMessage}
        style={styles.input}
      />
      <Button title="Send Message" onPress={sendMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  messagesContainer: {
    flex: 1,
    marginVertical: 10,
  },
  message: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f1f1f1',
  },
  messageUser: {
    fontWeight: 'bold',
  },
  messageText: {
    marginTop: 5,
  },
  messageTimestamp: {
    marginTop: 5,
    fontSize: 10,
    color: '#888',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default MQTTClient;
