import React, { useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  BackHandler,
  Animated,
  Dimensions,
  ScrollView,
  ImageBackground,
  StatusBar as RNStatusBar,
  Platform,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { Ionicons } from '@expo/vector-icons';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { colors, isDarkMode } = useTheme();
  const { gameState, resetGame } = useGame();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const buttonAnim1 = useRef(new Animated.Value(0)).current;
  const buttonAnim2 = useRef(new Animated.Value(0)).current;

  // Reset any existing game when returning to home screen
  useFocusEffect(
    useCallback(() => {
      console.log("HomeScreen: Screen focused, resetting game");
      resetGame();
      
      // Start animations when screen is focused
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(buttonAnim1, {
          toValue: 1,
          duration: 600,
          delay: 400,
          useNativeDriver: true,
        }),
        Animated.timing(buttonAnim2, {
          toValue: 1,
          duration: 600,
          delay: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, [resetGame, fadeAnim, scaleAnim, translateY, buttonAnim1, buttonAnim2])
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

  const FeatureCard = ({ icon, title, description }: { icon: string, title: string, description: string }) => (
    <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
      <Ionicons name={icon as any} size={28} color={colors.primary} />
      <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.featureDescription, { color: colors.text + 'CC' }]}>
        {description}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.heroSection,
            { 
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: translateY }
              ]
            }
          ]}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Image 
                source={require('../../assets/icon.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.title, { color: colors.primary }]}>Mölkky Assist AI</Text>
            <View style={styles.taglineContainer}>
              <Text style={[styles.subtitle, { color: colors.text }]}>
                Your Smart Scoreboard & Strategy Assistant
              </Text>
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <Animated.View style={{ opacity: buttonAnim1, transform: [{ translateY: Animated.multiply(buttonAnim1, -20) }] }}>
              <TouchableOpacity 
                style={[styles.primaryButton, { backgroundColor: colors.primary }]} 
                onPress={handleNewGame}
                activeOpacity={0.8}
                accessibilityLabel="Start a new game"
              >
                <Ionicons name="play-circle" size={24} color="white" style={styles.buttonIcon} />
                <Text style={styles.primaryButtonText}>Start New Game</Text>
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View style={{ opacity: buttonAnim2, transform: [{ translateY: Animated.multiply(buttonAnim2, -10) }] }}>
              <TouchableOpacity 
                style={[styles.secondaryButton, { backgroundColor: 'transparent', borderColor: colors.primary }]} 
                onPress={handleSettings}
                activeOpacity={0.8}
                accessibilityLabel="Open settings"
              >
                <Ionicons name="settings-outline" size={20} color={colors.primary} style={styles.buttonIcon} />
                <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Settings</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
        
        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Features</Text>
          
          <View style={styles.featureCards}>
            <FeatureCard 
              icon="calculator-outline" 
              title="Smart Scoring" 
              description="Automatically track scores and turns with intelligent validation"
            />
            <FeatureCard 
              icon="camera-outline" 
              title="Pin Detection" 
              description="Take photos of pin layouts and get automatic pin recognition"
            />
            <FeatureCard 
              icon="analytics-outline" 
              title="Strategy AI" 
              description="Receive AI-powered recommendations for optimal throws"
            />
            <FeatureCard 
              icon="people-outline" 
              title="Multiplayer" 
              description="Support for multiple players with custom names and stats tracking"
            />
          </View>
        </View>
        
        <View style={styles.footer}>
          <Ionicons name="information-circle-outline" size={18} color={colors.text + '80'} style={styles.footerIcon} />
          <Text style={[styles.footerText, { color: colors.text + '80' }]}>
            Version 1.0.0 | Mölkky Assist Team
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0,
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoBackground: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  logo: {
    width: 180,
    height: 180,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  taglineContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 40,
    width: '100%',
    paddingHorizontal: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 15,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 15,
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 10,
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  featureCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
    paddingHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerIcon: {
    marginRight: 6,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
  },
});

export default HomeScreen;
