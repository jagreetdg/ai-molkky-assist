import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { GameProvider } from './src/context/GameContext';
import { initTensorFlow } from './src/services/imageAnalysisService';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  // Initialize TensorFlow.js and other resources when the app starts
  useEffect(() => {
    async function prepare() {
      try {
        // Initialize TensorFlow
        await initTensorFlow();
        console.log('TensorFlow.js initialized successfully');
        
        // Simulate some loading time for other resources
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Failed to initialize resources:', error);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    // Hide the splash screen after resources are loaded
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <GameProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </GameProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
