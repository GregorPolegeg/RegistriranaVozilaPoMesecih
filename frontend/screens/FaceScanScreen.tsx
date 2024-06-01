import React, { useState } from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import config from '../config';



const FaceScanScreen = () => {
  const [videoPath, setVideoPath] = useState<string | null>(null);

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
          Alert.alert('Error', 'File name does not exisst');
          return;
        }

        let formData = new FormData();

        const fileBlob = await (await fetch(videoPath)).blob();
        formData.append('file', {
          uri: videoPath,
          name: fileName,
          type: fileBlob.type,
        } as any);

        const responseUpload = await axios.post(uploadUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (responseUpload.status === 200) {
          Alert.alert('Success', 'Video uploaded successfully!');
        } else {
          Alert.alert('Error', 'Failed to upload video');
        }
      } catch (error) {
        console.error('Upload error: ', error);
        Alert.alert('Error', 'Failed to upload video');
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
