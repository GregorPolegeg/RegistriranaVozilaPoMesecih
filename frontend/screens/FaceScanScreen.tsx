import React, { useState, useRef, useEffect } from 'react';
import { View, Button, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import axios from 'axios';
import config from '../config';

const FaceScanScreen: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [videoPath, setVideoPath] = useState<string>('');
  const [recordedDuration, setRecordedDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
    })();
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleRecord = async () => {
    if (cameraRef.current && !recording) {
      setRecording(true);
      setStartTime(Date.now());
      setRecordedDuration(0);
      try {
        const video = await cameraRef.current.recordAsync({
          maxDuration: 10, // Record for 10 seconds
        });

        if(!video){
            console.error('no video');
            return; 
        }
        
        setVideoPath(video.uri);
      } catch (error) {
        console.error('Recording error: ', error);
      } finally {
        setRecording(false);
      }
    }
  };

  const handleStopRecord = () => {
    if (cameraRef.current && recording) {
      cameraRef.current.stopRecording();
      if (startTime) {
        const duration = Date.now() - startTime;
        setRecordedDuration(duration);
      }
    }
  };

  const handleUpload = async () => {
    if (videoPath && recordedDuration >= 10000) {
      const uploadUrl = `${config.apiBaseUrl}/users/login`; // Update with your endpoint
      const fileName = videoPath.split('/').pop();

      try {
        if (!fileName) {
          Alert.alert('Error', 'File name does not exist');
          return;
        }
        const formData = new FormData();
        formData.append('file', {
          uri: videoPath,
          name: fileName,
          type: 'video/mp4',
        } as any);
        if (location) {
          formData.append('latitude', location.latitude.toString());
          formData.append('longitude', location.longitude.toString());
        }

        const response = await axios.post(uploadUrl, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.status === 200) {
          Alert.alert('Success', 'Video uploaded successfully!');
        } else {
          Alert.alert('Error', 'Failed to upload video');
        }
      } catch (error) {
        console.error('Upload error: ', error);
        Alert.alert('Error', 'Failed to upload video');
      }
    } else {
      Alert.alert('Error', 'No video to upload or video duration is too short');
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
        onMountError={({ message }) => console.error('Camera mount error:', message)}
      >
        <View style={styles.buttonContainer}>
          {!recording ? (
            <Button title="Record" onPress={handleRecord} />
          ) : (
            <Button title="Stop" onPress={handleStopRecord} />
          )}
          <Button title="Upload" onPress={handleUpload} disabled={!videoPath || recordedDuration < 10000} />
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
});

export default FaceScanScreen;
