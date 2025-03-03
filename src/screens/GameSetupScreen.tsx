import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Alert
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList, GameState } from '../types';
import PlayerList from '../components/PlayerList';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';

type GameSetupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GameSetup'>;

const GameSetupScreen = () => {
  const navigation = useNavigation<GameSetupScreenNavigationProp>();
  const { colors } = useTheme();
  const { initGame } = useGame();
  const [players, setPlayers] = useState<string[]>(['Player 1', 'Player 2']);
  const [isStartingGame, setIsStartingGame] = useState(false);

  // Handle hardware back button press
  useEffect(() => {
    const handleBackPress = () => {
      // Navigate to Home screen instead of going back in navigation stack
      navigation.navigate('Home');
      return true; // Prevent default behavior
    };

    // Add event listener for hardware back button
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

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
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Game Setup</Text>
          <Text style={[styles.subtitle, { color: colors.text + '99' }]}>Add players (2-10)</Text>
        </View>
        
        <PlayerList 
          players={players} 
          onPlayersChange={handlePlayersChange}
          minPlayers={2}
          maxPlayers={10}
        />
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.startButton, { backgroundColor: colors.success }]} 
            onPress={startGame}
            disabled={players.length < 2 || isStartingGame}
          >
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 20,
  },
  startButton: {
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GameSetupScreen;
