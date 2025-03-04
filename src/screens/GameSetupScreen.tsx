import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Alert,
  Animated,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, GameState } from '../types';
import PlayerList from '../components/PlayerList';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import AnimatedContainer from '../components/AnimatedContainer';
import AppButton from '../components/AppButton';

type GameSetupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GameSetup'>;

const GameSetupScreen = () => {
  const navigation = useNavigation<GameSetupScreenNavigationProp>();
  const { colors, isDarkMode } = useTheme();
  const { initGame } = useGame();
  const [players, setPlayers] = useState<string[]>(['Player 1', 'Player 2']);
  const [isStartingGame, setIsStartingGame] = useState(false);
  
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Handle hardware back button press
  useEffect(() => {
    const handleBackPress = () => {
      // Navigate to Home screen instead of going back in navigation stack
      navigation.navigate('Home');
      return true; // Prevent default behavior
    };

    // Add event listener for hardware back button
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    
    // Start header animation
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Clean up the event listener on component unmount
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [navigation]);

  const handlePlayersChange = (newPlayers: string[]) => {
    setPlayers(newPlayers);
  };

  const startGame = () => {
    try {
      console.log("GameSetupScreen: Starting game with players:", players);
      setIsStartingGame(true);
      
      // Initialize the game and get the new state
      const newGameState = initGame(players);
      console.log("GameSetupScreen: Game initialized successfully, state:", JSON.stringify(newGameState));
      
      // Navigate directly to GamePlay using navigate instead of replace
      // This prevents HomeScreen from mounting and resetting the game
      console.log("GameSetupScreen: Navigating to GamePlay");
      navigation.navigate('GamePlay');
    } catch (error) {
      console.error("GameSetupScreen: Error starting game:", error);
      setIsStartingGame(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? 30 : 0 }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent"
        translucent={true}
      />
      
      <Animated.View 
        style={[
          styles.header,
          { 
            backgroundColor: colors.card,
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0]
            })}]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Game Setup</Text>
        <View style={styles.headerRight} />
      </Animated.View>
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <View style={styles.content}>
          <AnimatedContainer index={0}>
            <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.subtitle, { color: colors.text + '99' }]}>
                Add players (2-10) to start a new game
              </Text>
            </View>
          </AnimatedContainer>
          
          <AnimatedContainer index={1}>
            <PlayerList 
              players={players} 
              onPlayersChange={handlePlayersChange}
              minPlayers={2}
              maxPlayers={10}
            />
          </AnimatedContainer>
          
          <AnimatedContainer index={2} delay={200}>
            <View style={styles.buttonContainer}>
              <AppButton 
                title="Start Game"
                variant="success"
                icon="play"
                onPress={startGame}
                disabled={players.length < 2 || isStartingGame}
                fullWidth
              />
            </View>
          </AnimatedContainer>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    flex: 1,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default GameSetupScreen;
