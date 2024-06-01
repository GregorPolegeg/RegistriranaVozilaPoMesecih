import React, { useState } from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios, { AxiosError } from 'axios';
import { useRoute } from '@react-navigation/native';
import config from '../config';

const FaceScanScreen = () => {
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const route = useRoute();
  const { userId } = route.params as { userId: string };

  const pickVideo = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setVideoPath(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (videoPath) {
      const uploadUrl = `${config.apiBaseUrl}/users/uploadVideo`;
      const fileName = videoPath.split('/').pop();

      try {
        if (!fileName) {
          Alert.alert('Error', 'File name does not exist');
          return;
        }

        let formData = new FormData();

        const fileBlob = await (await fetch(videoPath)).blob();
        formData.append('file', {
          uri: videoPath,
          name: fileName,
          type: fileBlob.type,
        } as any);

        // Append userId from route params
        formData.append('userId', userId);

        const responseUpload = await axios.post(uploadUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (responseUpload.status === 200) {
          Alert.alert('Success', 'Video uploaded successfully!');
        } else {
          console.error('Upload error response:', responseUpload.data);
          Alert.alert('Error', 'Failed to upload video');
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Upload error:', error.response ? error.response.data : error.message);
          Alert.alert('Error', error.response?.data?.message || 'Failed to upload video');
        } else {
          console.error('Upload error:', error);
          Alert.alert('Error', 'Failed to upload videoo');
        }
      }
    } else {
      Alert.alert('Error', 'No video to upload');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Record Video" onPress={pickVideo} />
      {videoPath && <Button title="Upload Video" onPress={handleUpload} />}
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

export default FaceScanScreen;
