import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Platform,
  BackHandler,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, PinState, OptimalMove } from '../types/index';
import { detectPinsFromImage, calculateOptimalMove } from '../services/imageAnalysisService';
import { useTheme } from '../context/ThemeContext';

type AnalysisScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Analysis'>;
type AnalysisScreenRouteProp = RouteProp<RootStackParamList, 'Analysis'>;

const { width } = Dimensions.get('window');

const AnalysisScreen = () => {
  const navigation = useNavigation<AnalysisScreenNavigationProp>();
  const route = useRoute<AnalysisScreenRouteProp>();
  const { imageUri } = route.params;
  const { colors } = useTheme();
  
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [pinStates, setPinStates] = useState<PinState[]>([]);
  const [optimalMove, setOptimalMove] = useState<OptimalMove | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  useEffect(() => {
    const analyzeImage = async () => {
      try {
        const detectedPins = await detectPinsFromImage(imageUri);
        setPinStates(detectedPins);
        const move = calculateOptimalMove(detectedPins);
        setOptimalMove(move);
      } catch (error) {
        console.error('Error analyzing image:', error);
        setAnalysisError('Failed to analyze the image. Please try again.');
      } finally {
        setIsAnalyzing(false);
      }
    };
    
    analyzeImage();
  }, [imageUri]);

  // Handle hardware back button
  useEffect(() => {
    const handleBackPress = () => {
      // Navigate back to GamePlay screen instead of using the default back behavior
      navigation.navigate('GamePlay');
      return true; // Prevent default behavior
    };

    // Add event listener for hardware back button
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    // Clean up the event listener on component unmount
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [navigation]);
  
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
                backgroundColor: pin.isStanding ? colors.success : colors.error,
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
              {optimalMove.targetPins.length === 1 
                ? `Aim directly at pin ${optimalMove.targetPins[0]} for ${optimalMove.targetPins[0]} points.`
                : `Target pins ${optimalMove.targetPins.join(', ')} for ${optimalMove.expectedScore} points.`
              }
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
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

  // Create grid cells for the 8x8 grid
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
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView bounces={false}>
        <View style={styles.imageContainer}>
          <View style={styles.imageFrame}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            
            {/* Grid overlay with 8x8 grid */}
            {renderGridOverlay()}
            
            {!isAnalyzing && renderPinOverlay()}
            
            {isAnalyzing && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Analyzing pin positions...</Text>
              </View>
            )}
          </View>
        </View>

        {analysisError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={40} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{analysisError}</Text>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          !isAnalyzing && renderOptimalMoveInfo()
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: width,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  imageFrame: {
    width: width - 32,
    height: width - 32,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  gridLine: {
    // Styles applied inline in renderGridOverlay
  },
  pinOverlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  pinMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  pinNumber: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  optimalMoveContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
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
    fontWeight: '600',
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
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
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
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
});

export default AnalysisScreen;
