import React, {useRef, useState} from "react";
import {View, Button, Alert, StyleSheet, Platform} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import {useAuth} from "../AuthContext";
import Webcam from "react-webcam";
import {PYTHON_URL} from "@env";
import {NavigationProp, ParamListBase} from "@react-navigation/native";

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const LoginWithPicture: React.FC<Props> = ({navigation}) => {
  const [imagePath, setImagePath] = useState<string | null>(null);
  const {userId, login2FA} = useAuth();
  const webcamRef = useRef<Webcam>(null);

  const pickImage = async () => {
    if (Platform.OS === "web") {
      // Handle web image capture logic
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        setImagePath(imageSrc);
      }
    } else {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission to access camera is required!");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImagePath(result.assets[0].uri);
      }
    }
  };

  const handleUpload = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID is missing");
      return;
    }

    if (!imagePath) {
      Alert.alert("Error", "No image to upload");
      return;
    }

    let formData = new FormData();
    if (Platform.OS === "web") {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      formData.append("file", blob, "webcam-image.jpg");
    } else {
      const fileName = imagePath.split("/").pop();
      if (!fileName) {
        Alert.alert("Error", "File name does not exist");
        return;
      }

      const fileBlob = await (await fetch(imagePath)).blob();
      formData.append("file", {
        uri: imagePath,
        name: fileName,
        type: fileBlob.type,
      } as any);
    }

    formData.append("userId", userId);

    const uploadUrl = `${PYTHON_URL}/users/uploadImage`;
    console.log(PYTHON_URL)

    try {
      const responseUpload = await axios.post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (responseUpload.status === 200) {
        await login2FA();
        navigation.navigate("Home");
        Alert.alert("Success", "Authenticated!");
      } else {
        console.error("Upload error response:", responseUpload.data);
        Alert.alert("Error", "Not authenticated!");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Upload error:",
          error.response ? error.response.data : error.message
        );
        Alert.alert(
          "Error",
          error.response?.data?.message || "Failed to upload image"
        );
      } else {
        console.error("Upload error:", error);
        Alert.alert("Error", "Failed to upload image");
      }
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        <View style={styles.webContainer}>
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
          <Button title="Take Picture" onPress={pickImage} />
        </View>
      ) : (
        <Button title="Take Picture" onPress={pickImage} />
      )}
      {imagePath && <Button title="Upload Picture" onPress={handleUpload} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  webContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoginWithPicture;
