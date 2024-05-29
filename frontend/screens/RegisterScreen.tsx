import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import config from '../config';

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [firstName, setFirstname] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async () => {
    try {
      const response = await axios.post(`${config.apiBaseUrl}/users/register`, {
        firstName,
        lastName,
        email,
        password,
      });

      if (response.status === 201) {
        setSuccess('Registration successful. Please log in.');
        setError('');
        navigation.navigate('FaceScan');
      } else {
        throw new Error('Registration failed');
      }
    } catch (err) {
      setSuccess('');
      setError('Registration failed. Please try again.');
      console.error('Registration error', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Firstname"
        value={firstName}
        onChangeText={setFirstname}
      />
      <TextInput
        style={styles.input}
        placeholder="Lastname"
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
