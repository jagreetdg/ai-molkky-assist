import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  Dimensions
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, PinState, OptimalMove } from '../types/index';
import { detectPinsFromImage, calculateOptimalMove } from '../services/imageAnalysisService';

type AnalysisScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Analysis'>;
type AnalysisScreenRouteProp = RouteProp<RootStackParamList, 'Analysis'>;

const { width } = Dimensions.get('window');

const AnalysisScreen = () => {
  const navigation = useNavigation<AnalysisScreenNavigationProp>();
  const route = useRoute<AnalysisScreenRouteProp>();
  const { imageUri } = route.params;
  
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [pinStates, setPinStates] = useState<PinState[]>([]);
  const [optimalMove, setOptimalMove] = useState<OptimalMove | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  useEffect(() => {
    const analyzeImage = async () => {
      try {
        // Detect pins from the image
        const detectedPins = await detectPinsFromImage(imageUri);
        setPinStates(detectedPins);
        
        // Calculate the optimal move
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
                backgroundColor: pin.isStanding ? '#2ecc71' : '#e74c3c',
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
        <Text style={styles.sectionTitle}>AI Analysis</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Standing Pins</Text>
          <View style={styles.pinGrid}>
            {standingPins.map(pin => (
              <View key={pin.number} style={styles.pinBadge}>
                <Text style={styles.pinBadgeText}>{pin.number}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Optimal Move</Text>
          <Text style={styles.optimalMoveText}>
            Target {optimalMove.targetPins.length > 1 ? 'pins' : 'pin'}:
          </Text>
          <View style={styles.pinGrid}>
            {optimalMove.targetPins.map(pinNumber => (
              <View key={pinNumber} style={[styles.pinBadge, styles.optimalPinBadge]}>
                <Text style={styles.pinBadgeText}>{pinNumber}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Expected Score</Text>
              <Text style={styles.statValue}>{optimalMove.expectedScore}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Win Probability</Text>
              <Text style={styles.statValue}>
                {Math.round(optimalMove.winProbability * 100)}%
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Strategy Tip</Text>
          <Text style={styles.tipText}>
            {optimalMove.targetPins.length === 1 
              ? `Aim directly at pin ${optimalMove.targetPins[0]} for the best chance to score ${optimalMove.targetPins[0]} points.`
              : `Try to knock down ${optimalMove.targetPins.length} pins to score ${optimalMove.expectedScore} points. Focus on the area with pins ${optimalMove.targetPins.join(', ')}.`
            }
          </Text>
        </View>
      </View>
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        {!isAnalyzing && renderPinOverlay()}
        
        {isAnalyzing && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>Analyzing pin positions...</Text>
          </View>
        )}
      </View>
      
      {analysisError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={40} color="#e74c3c" />
          <Text style={styles.errorText}>{analysisError}</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {!isAnalyzing && renderOptimalMoveInfo()}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Back to Game</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.navigate('Camera')}
            >
              <Text style={styles.buttonText}>Take New Photo</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  imageContainer: {
    width: '100%',
    height: width * 0.75, // 4:3 aspect ratio
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  pinOverlayContainer: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
  },
  pinMarker: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  pinNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginVertical: 15,
  },
  optimalMoveContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3498db',
  },
  optimalMoveText: {
    fontSize: 16,
    marginBottom: 10,
  },
  pinGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  pinBadge: {
    backgroundColor: '#95a5a6',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  optimalPinBadge: {
    backgroundColor: '#2ecc71',
  },
  pinBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  tipText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#2c3e50',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 0,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: '#3498db',
  },
  secondaryButton: {
    backgroundColor: '#2ecc71',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AnalysisScreen;
