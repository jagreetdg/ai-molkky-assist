import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator
} from 'react-native';
// @ts-ignore
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/index';
import { initTensorFlow } from '../services/imageAnalysisService';

type CameraScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Camera'>;
type CameraScreenRouteProp = RouteProp<RootStackParamList, 'Camera'>;

// Define camera types manually to avoid TypeScript issues
const CameraType = {
  back: 'back',
  front: 'front'
};

const CameraScreen = () => {
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const route = useRoute<CameraScreenRouteProp>();
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [flash, setFlash] = useState(false); 
  const [isLoading, setIsLoading] = useState(true);
  
  const cameraRef = useRef(null);
  
  useEffect(() => {
    (async () => {
      try {
        await initTensorFlow();
      } catch (error) {
        console.error('Failed to initialize TensorFlow.js:', error);
      }
      
      // @ts-ignore
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      
      setHasPermission(
        cameraStatus === 'granted' && mediaStatus === 'granted'
      );
      
      setIsLoading(false);
    })();
  }, []);
  
  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    try {
      // @ts-ignore
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });
      
      await MediaLibrary.saveToLibraryAsync(photo.uri);
      
      navigation.navigate('Analysis', {
        imageUri: photo.uri,
      });
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    }
  };
  
  const toggleCameraType = () => {
    setType(current => (
      current === CameraType.back 
        ? CameraType.front 
        : CameraType.back
    ));
  };
  
  const toggleFlash = () => {
    setFlash(current => !current);
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Initializing camera...</Text>
      </View>
    );
  }
  
  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.permissionText}>Requesting camera permissions...</Text>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color="#ff0000" />
        <Text style={styles.permissionText}>No access to camera</Text>
        <Text style={styles.permissionSubtext}>
          Please enable camera access in your device settings to use this feature.
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* @ts-ignore */}
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={type}
        flashMode={flash ? 'on' : 'off'}
      >
        <View style={styles.overlay}>
          <View style={styles.guideContainer}>
            <Text style={styles.guideText}>
              Position all Mölkky pins in frame
            </Text>
          </View>
          
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleFlash}
            >
              <Ionicons 
                name={flash ? "flash-outline" : "flash-off-outline"} 
                size={24} 
                color="white" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleCameraType}
            >
              <Ionicons name="camera-reverse" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Camera>
      
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.captureButton}
          onPress={takePicture}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
        
        <View style={styles.spacer} />
      </View>
    </View>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  guideContainer: {
    alignItems: 'center',
    marginTop: 40,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    alignSelf: 'center',
  },
  guideText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
    padding: 10,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 5,
    fontSize: 16,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: '#1e88e5',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1e88e5',
  },
  spacer: {
    width: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  permissionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  permissionSubtext: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
  },
});
