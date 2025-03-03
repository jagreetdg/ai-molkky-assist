import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { GameProvider } from './src/context/GameContext';
import { initTensorFlow } from './src/services/imageAnalysisService';

export default function App() {
  // Initialize TensorFlow.js when the app starts
  useEffect(() => {
    const initTF = async () => {
      try {
        await initTensorFlow();
        console.log('TensorFlow.js initialized successfully');
      } catch (error) {
        console.error('Failed to initialize TensorFlow.js:', error);
      }
    };

    initTF();
  }, []);

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
