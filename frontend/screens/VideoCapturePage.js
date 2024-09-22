import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera/legacy';
import { Video } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { storage } from '../services/firebaseConfig';  
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; 

export default function VideoCapturePage() {
  const [hasPermission, setHasPermission] = useState(true);  
  const [cameraReady, setCameraReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState(null);  
  const [loading, setLoading] = useState(false); // State to show loading screen
  const cameraRef = useRef(null);  
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const startRecording = async () => {
    if (!cameraReady || !cameraRef.current) return;

    try {
      setIsRecording(true);
      const video = await cameraRef.current.recordAsync({
        quality: Camera.Constants.VideoQuality['720p'],
        maxDuration: 60,  
      });
      setIsRecording(false);
      setVideoUri(video.uri);  // Save the video URI to state for preview
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not record video');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  const uploadVideoToFirebase = async (videoUri) => {
    try {
      const videoRef = ref(storage, `videos/${Date.now()}-medication-video.mp4`);
      const response = await fetch(videoUri);
      const blob = await response.blob();
      const uploadTask = uploadBytesResumable(videoRef, blob);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
          },
          (error) => {
            console.error('Error during video upload:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('Video uploaded successfully. Download URL:', downloadURL);
              resolve(downloadURL);
            } catch (error) {
              console.error('Error getting download URL:', error);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error in uploadVideoToFirebase function:', error);
      throw error;
    }
  };

  const uploadVideo = async (videoUri) => {
    setLoading(true);
    try {
      const downloadURL = await uploadVideoToFirebase(videoUri);
      console.log('Download URL:', downloadURL);
  
      const response = await fetch('https://snapill-backend-b37ba101e223.herokuapp.com/process-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: downloadURL,
        }),
      });
  
      if (response.ok) {
        const responseData = await response.json();
        console.log('Video processed successfully', responseData);
        console.log(responseData["medication_data"]);
        res = responseData["medication_data"]
        const parsedMedication = {
          name: res["medication_name"],
          dosage: res["dosage"],
          instructions: res["instructions"],
          quantity: "1",
          reminderTime: res["time"],
        };
  
        navigation.navigate('AddMedication', { medication: parsedMedication });
      } else {
        console.log('Error processing video:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error uploading or processing video:', error);
    } finally {
      setLoading(false);
    }
  };

  const reRecord = () => {
    setVideoUri(null);
  };
  
  const { height } = Dimensions.get('window');

  if (hasPermission === null) {
    return (
      <View style={styles.loaderContainer}>
        <Text>Requesting Camera Permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to the camera. Please enable camera permissions in your device settings.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Processing video...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {videoUri ? (
        <View style={styles.previewContainer}>
          <Video
            source={{ uri: videoUri }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="cover"
            shouldPlay
            isLooping
            style={{ height: height, width: '100%' }}
          />
          <View style={styles.previewButtons}>
            <TouchableOpacity style={styles.snapchatButton} onPress={() => uploadVideo(videoUri)}>
              <Text style={styles.buttonText}>Upload</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.snapchatButton} onPress={reRecord}>
              <Text style={styles.buttonText}>Re-record</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <Camera
            style={styles.camera}
            ref={cameraRef}
            onCameraReady={() => setCameraReady(true)}
          />
          <View style={styles.controls}>
            <TouchableOpacity
              style={isRecording ? styles.recordingButton : styles.recordButton}
              onPressIn={startRecording}
              onPressOut={stopRecording}
            >
              <Text style={styles.recordButtonText}>
                {isRecording ? 'Recording...' : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'darkred',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewButtons: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  snapchatButton: {
    backgroundColor: '#fffc00',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});