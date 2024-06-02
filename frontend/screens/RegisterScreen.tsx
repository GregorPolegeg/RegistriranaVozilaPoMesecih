import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import config from '../config';
import { API_URL } from '@env';

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async () => {
    try {
      const response = await axios.post(`${API_URL}/users/register`, {
        firstName,
        lastName,
        email,
        password,
      });

      if (response.status === 201) {
        setSuccess('Registration successful. Please upload a video.');
        setError('');
        navigation.navigate('FaceScan', { userId: response.data.userId });
      } else {
        throw new Error('Registration failed');
      }
    } catch (err: any) {
      setSuccess('');
      setError('Registration failed. Please try again.');

      if (axios.isAxiosError(err)) {
        console.error('Axios error', err.response?.data);
        Alert.alert('Registration error', JSON.stringify(err.response?.data));
      } else {
        console.error('Registration error', err);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Register" onPress={handleRegister} />
      <Button title="Go to Login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  success: {
    color: 'green',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
});

export default RegisterScreen;
