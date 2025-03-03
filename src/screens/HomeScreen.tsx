import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, BackHandler } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { colors, isDarkMode } = useTheme();
  const { gameState, resetGame } = useGame();

  // Reset any existing game when returning to home screen
  // but only when the screen is focused, not during other navigation
  useFocusEffect(
    useCallback(() => {
      console.log("HomeScreen: Screen focused, resetting game");
      resetGame();
    }, [resetGame])
  );

  const handleNewGame = useCallback(() => {
    navigation.navigate('GameSetup');
  }, [navigation]);

  const handleSettings = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  // Handle hardware back button - exit app from home screen
  useEffect(() => {
    const handleBackPress = () => {
      // This will exit the app when back is pressed on the home screen
      BackHandler.exitApp();
      return true; // Prevent default behavior
    };

    // Add event listener for hardware back button
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    // Clean up the event listener on component unmount
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: colors.primary }]}>Mölkky Assist AI</Text>
        <Text style={[styles.subtitle, { color: colors.text + '99' }]}>
          Your Smart Scoreboard & Strategy Assistant
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]} 
          onPress={handleNewGame}
          accessibilityLabel="Start a new game"
        >
          <Text style={styles.buttonText}>New Game</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.info }]} 
          onPress={handleSettings}
          accessibilityLabel="Open settings"
        >
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.text + '80' }]}>
          Take photos of pin positions and get AI-powered strategy recommendations
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  },
  button: {
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
  },
});

export default HomeScreen;
