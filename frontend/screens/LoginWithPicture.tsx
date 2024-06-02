import React, { useState } from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import config from '../config';

const LoginWithPicture: React.FC = () => {
  const [imagePath, setImagePath] = useState<string | null>(null);
  const route = useRoute();
  const { userId } = route.params as { userId: string };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImagePath(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (imagePath) {
      const uploadUrl = `${config.apiBaseUrl}/users/uploadImage`;
      const fileName = imagePath.split('/').pop();

      try {
        if (!fileName) {
          Alert.alert('Error', 'File name does not exist');
          return;
        }

        let formData = new FormData();

        const fileBlob = await (await fetch(imagePath)).blob();
        formData.append('file', {
          uri: imagePath,
          name: fileName,
          type: fileBlob.type,
        } as any);

        formData.append('userId', userId);

        const responseUpload = await axios.post(uploadUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (responseUpload.status === 200) {
          Alert.alert('Success', 'Image uploaded successfully!');
        } else {
          console.error('Upload error response:', responseUpload.data);
          Alert.alert('Error', 'Failed to upload image');
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Upload error:', error.response ? error.response.data : error.message);
          Alert.alert('Error', error.response?.data?.message || 'Failed to upload image');
        } else {
          console.error('Upload error:', error);
          Alert.alert('Error', 'Failed to upload image');
        }
      }
    } else {
      Alert.alert('Error', 'No image to upload');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Take Picture" onPress={pickImage} />
      {imagePath && <Button title="Upload Picture" onPress={handleUpload} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginWithPicture;
