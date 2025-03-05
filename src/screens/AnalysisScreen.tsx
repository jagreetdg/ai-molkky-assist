import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Alert,
  Platform,
  BackHandler,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, PinState, OptimalMove } from '../types/index';
import { detectPinsFromImage, calculateOptimalMove } from '../services/imageAnalysisService';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';

type AnalysisScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Analysis'>;
type AnalysisScreenRouteProp = RouteProp<RootStackParamList, 'Analysis'>;

const { width } = Dimensions.get('window');

const AnalysisScreen = () => {
  const navigation = useNavigation<AnalysisScreenNavigationProp>();
  const route = useRoute<AnalysisScreenRouteProp>();
  const { imageUri } = route.params;
  const { colors, isDarkMode } = useTheme();
  const { gameState } = useGame();
  
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [pinStates, setPinStates] = useState<PinState[]>([]);
  const [optimalMove, setOptimalMove] = useState<OptimalMove | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>('');
  const [processingStep, setProcessingStep] = useState<string>('Initializing...');
  
  const renderPinOverlay = () => {
    if (pinStates.length === 0) return null;
    
    return (
      <View style={styles.pinOverlayContainer}>
        {pinStates.map((pin) => (
          <View
            key={pin.number}
            style={[
              styles.pinMarker,
              {
                left: pin.position.x,
                top: pin.position.y,
                backgroundColor: colors.success, // Always show as standing (green)
              },
            ]}
          >
            <Text style={styles.pinNumber}>{pin.number}</Text>
          </View>
        ))}
      </View>
    );
  };
  
  const renderOptimalMoveInfo = () => {
    if (!optimalMove) return null;
    
    const standingPins = pinStates.filter(pin => pin.isStanding);
    
    return (
      <View style={styles.optimalMoveContainer}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="analytics-outline" size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>AI Analysis</Text>
          </View>

          <View style={styles.cardSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Standing Pins</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pinScroll}>
              {standingPins.map(pin => (
                <View key={pin.number} style={[styles.pinBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.pinBadgeText}>{pin.number}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.cardSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended Move</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pinScroll}>
              {optimalMove.targetPins.map(pinNumber => (
                <View key={pinNumber} style={[styles.pinBadge, { backgroundColor: colors.success }]}>
                  <Text style={styles.pinBadgeText}>{pinNumber}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.background }]}>
              <Ionicons name="trophy-outline" size={24} color={colors.success} />
              <Text style={[styles.statValue, { color: colors.text }]}>{optimalMove.expectedScore}</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Expected Score</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.background }]}>
              <Ionicons name="trending-up-outline" size={24} color={colors.warning} />
              <Text style={[styles.statValue, { color: colors.text }]}>{Math.round(optimalMove.winProbability * 100)}%</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Win Probability</Text>
            </View>
          </View>

          <View style={styles.tipContainer}>
            <Ionicons name="bulb-outline" size={24} color={colors.warning} />
            <Text style={[styles.tipText, { color: colors.text }]}>
              {optimalMove.strategyExplanation}
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('GamePlay')}
          >
            <Ionicons name="arrow-back-outline" size={20} color="white" />
            <Text style={styles.buttonText}>Back to Game</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.success }]}
            onPress={() => navigation.navigate('Camera')}
          >
            <Ionicons name="camera-outline" size={20} color="white" />
            <Text style={styles.buttonText}>New Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderGridOverlay = () => {
    return (
      <View style={styles.gridOverlay}>
        {/* Horizontal lines */}
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <View 
            key={`h-${i}`} 
            style={[
              styles.gridLine, 
              { 
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${i * 12.5}%`,
                height: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }
            ]} 
          />
        ))}
        
        {/* Vertical lines */}
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <View 
            key={`v-${i}`} 
            style={[
              styles.gridLine, 
              { 
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${i * 12.5}%`,
                width: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }
            ]} 
          />
        ))}
      </View>
    );
  };

  const renderAnalysisContent = () => {
    if (isAnalyzing) {
      return (
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>{processingStep}</Text>
          <Text style={[styles.loadingSubtext, { color: colors.text }]}>This may take a moment...</Text>
        </View>
      );
    }

    if (analysisError) {
      return (
        <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>{analysisError}</Text>
          <View style={styles.errorButtonContainer}>
            <TouchableOpacity 
              style={[styles.errorButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('GamePlay')}
            >
              <Text style={styles.errorButtonText}>Back to Game</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.errorButton, { backgroundColor: colors.success }]}
              onPress={() => {
                setIsAnalyzing(true);
                setAnalysisError('');
                navigation.navigate('Camera');
              }}
            >
              <Text style={styles.errorButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (pinStates.length === 0) {
      return (
        <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>No pins detected. Please try again with a clearer image.</Text>
          <View style={styles.errorButtonContainer}>
            <TouchableOpacity 
              style={[styles.errorButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('GamePlay')}
            >
              <Text style={styles.errorButtonText}>Back to Game</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.errorButton, { backgroundColor: colors.success }]}
              onPress={() => {
                setIsAnalyzing(true);
                setAnalysisError('');
                navigation.navigate('Camera');
              }}
            >
              <Text style={styles.errorButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('GamePlay')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>AI Analysis</Text>
          <View style={styles.headerRight} />
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
            {renderGridOverlay()}
            {renderPinOverlay()}
          </View>
          
          {renderOptimalMoveInfo()}
        </ScrollView>
      </View>
    );
  };

  useEffect(() => {
    const analyzeImage = async () => {
      // Reset error state and pin states at the beginning of new analysis
      setAnalysisError('');
      setPinStates([]);
      
      try {
        setProcessingStep('Detecting pins...');
        const detectedPins = await detectPinsFromImage(imageUri);
        
        // Only set pin states if we have valid pins
        if (detectedPins && detectedPins.length > 0) {
          setPinStates(detectedPins);
          
          setProcessingStep('Calculating optimal move...');
          // Convert null to undefined to match the expected type
          const move = calculateOptimalMove(detectedPins, gameState || undefined);
          setOptimalMove(move);
        } else {
          setAnalysisError('No pins detected in the image. Please try again.');
        }
      } catch (error) {
        // Only log the error, don't show system toast
        console.log('Image analysis failed:', error instanceof Error ? error.message : 'Unknown error');
        
        // Display user-friendly message on screen
        setAnalysisError(error instanceof Error ? error.message : 'Failed to analyze the image. Please try again.');
      } finally {
        setIsAnalyzing(false);
      }
    };
    
    analyzeImage();
  }, [imageUri, gameState]);

  const handleGoBack = () => {
    navigation.navigate('GamePlay');
  };

  const handleRetry = () => {
    setIsAnalyzing(true);
    setAnalysisError('');
    navigation.navigate('Camera');
  };

  // Handle hardware back button
  useEffect(() => {
    const handleBackPress = () => {
      handleGoBack();
      return true; // Prevent default behavior
    };

    // Add event listener for hardware back button
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    // Clean up the event listener on component unmount
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [navigation]);

  return renderAnalysisContent();
};

export default AnalysisScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  loadingSubtext: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  errorButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  errorButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  errorButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  imageContainer: {
    width: width,
    height: width,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
  },
  gridLine: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  pinOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pinMarker: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    transform: [{ translateX: -18 }, { translateY: -18 }],
    zIndex: 10,
  },
  pinNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  optimalMoveContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cardSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pinScroll: {
    flexDirection: 'row',
  },
  pinBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  pinBadgeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  tipText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
