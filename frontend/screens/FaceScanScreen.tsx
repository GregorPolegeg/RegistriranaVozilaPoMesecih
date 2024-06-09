import React, {useState, useRef, useCallback} from "react";
import {View, Button, Alert, StyleSheet, Platform, Text} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import {useRoute} from "@react-navigation/native";
import Webcam from "react-webcam";
import {PYTHON_URL} from "@env";

const FaceScanScreen = () => {
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const route = useRoute();
  const {userId} = route.params as {userId: string};
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const pickVideo = async () => {
    if (Platform.OS === "web") {
      // Handle web video recording logic
      setVideoPath(null);
    } else {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission to access camera is required!");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setVideoPath(result.assets[0].uri);
      }
    }
  };

  const handleUpload = async () => {
    let formData = new FormData();
    console.log(PYTHON_URL);
    if (Platform.OS === "web") {
      if (videoPath) {
        const videoBlob = await fetch(videoPath).then((r) => r.blob());
        formData.append("file", videoBlob, "webcam-video.mp4");
        formData.append("userId", userId);
        try {
          const responseUpload = await axios.post(
            `${PYTHON_URL}/users/uploadVideo`,
            formData,
            {
              headers: {"Content-Type": "multipart/form-data"},
            }
          );
          if (responseUpload.status === 200) {
            Alert.alert("Success", "Video uploaded successfully!");
          } else {
            Alert.alert("Error", "Failed to upload video");
          }
        } catch (error) {
          Alert.alert("Error", "Failed to upload video");
        }
      } else {
        Alert.alert("Error", "No video to upload");
      }
    } else {
      if (videoPath) {
        const fileName = videoPath.split("/").pop();
        if (!fileName) {
          Alert.alert("Error", "File name does not exist");
          return;
        }

        const fileBlob = await (await fetch(videoPath)).blob();
        formData.append("file", {
          uri: videoPath,
          name: fileName,
          type: fileBlob.type,
        } as any);
      } else {
        Alert.alert("Error", "No video to upload");
        return;
      }
    }

    formData.append("userId", userId);

    const uploadUrl = `${PYTHON_URL}/users/uploadVideo`;

    try {
      console.log(PYTHON_URL)
      const responseUpload = await axios.post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (responseUpload.status === 200) {
        Alert.alert("Success", "Video uploaded successfully!");
      } else {
        console.error("Upload error response:", responseUpload.data);
        Alert.alert("Error", "Failed to upload video");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Upload error:",
          error.response ? error.response.data : error.message
        );
        Alert.alert(
          "Error",
          error.response?.data?.message || "Failed to upload video"
        );
      } else {
        console.error("Upload error:", error);
        Alert.alert("Error", "Failed to upload video");
      }
    }
  };

  const handleStartCapture = useCallback(() => {
    if (webcamRef.current) {
      const stream = webcamRef.current.stream;
      if (stream) {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunksRef.current, {type: "video/mp4"});
          const url = URL.createObjectURL(blob);
          setVideoPath(url);
          chunksRef.current = []; // clear the chunks
        };

        mediaRecorder.start();
        setIsRecording(true);
      }
    }
  }, [webcamRef]);

  const handleStopCapture = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        <View style={styles.webContainer}>
          <Webcam audio={true} ref={webcamRef} />
          {!isRecording ? (
            <Button title="Start Capture" onPress={handleStartCapture} />
          ) : (
            <Button title="Stop Capture" onPress={handleStopCapture} />
          )}
        </View>
      ) : (
        <Button title="Record Video" onPress={pickVideo} />
      )}
      {videoPath && <Button title="Upload Video" onPress={handleUpload} />}
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

export default FaceScanScreen;
