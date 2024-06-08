import React, {useState, useEffect} from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Button,
} from "react-native";
import {NavigationProp, ParamListBase} from "@react-navigation/native";
import {useAuth} from "../AuthContext";
import axios from "axios";
import {API_URL, PYTHON_URL} from "@env";

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const HomeScreen: React.FC<Props> = ({navigation}) => {
  const {isLoggedIn, token, logout} = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogout = () => {
    logout();
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Home Screen {API_URL}</Text>
      <Text style={styles.title}>Welcome to the Home Screen {PYTHON_URL}</Text>
      {isLoggedIn ? (
        <View>
          <Button
            title="User profile"
            onPress={() => navigation.navigate("UserProfile")}
          />
          <Button
            title="Vehicle list"
            onPress={() => navigation.navigate("VehicleList")}
          />
          <Button
            title="Track trip"
            onPress={() => navigation.navigate("TripTracker")}
          />
          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Button title="Login" onPress={() => navigation.navigate("Login")} />
          <Button
            title="Vehicle list"
            onPress={() => navigation.navigate("VehicleList")}
          />
          <Button
            title="User profile"
            onPress={() => navigation.navigate("UserProfile")}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  item: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    width: "100%",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default HomeScreen;
