import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useFocusEffect, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Player, GameState } from '../types';
import { getActivePlayer, getPlayerRanking } from '../services/gameService';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import ScoreButton from '../components/ScoreButton';
import PlayerScoreCard from '../components/PlayerScoreCard';

type GamePlayScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GamePlay'>;
type GamePlayScreenRouteProp = RouteProp<RootStackParamList, 'GamePlay'>;

interface GamePlayScreenProps {
  route: GamePlayScreenRouteProp;
}

const GamePlayScreen = ({ route }: GamePlayScreenProps) => {
  const navigation = useNavigation<GamePlayScreenNavigationProp>();
  const { colors } = useTheme();
  const { gameState: contextGameState, updatePlayerScore, resetGame } = useGame();
  const [showScoreButtons, setShowScoreButtons] = useState(true);
  const [selectedPin, setSelectedPin] = useState<number | null>(null);
  const [localGameState, setLocalGameState] = useState<GameState | null>(null);
  
  // Use the game state from route params if available, otherwise use context
  const gameState = localGameState || route.params?.gameState || contextGameState;

  // Update local game state when context game state changes
  useEffect(() => {
    if (contextGameState) {
      setLocalGameState(contextGameState);
    }
  }, [contextGameState]);

  // Check game state when screen gains focus
  useFocusEffect(
    useCallback(() => {
      console.log("GamePlayScreen: useFocusEffect triggered, gameState from route:", route.params?.gameState);
      console.log("GamePlayScreen: useFocusEffect triggered, gameState from context:", contextGameState);
      console.log("GamePlayScreen: useFocusEffect triggered, combined gameState:", gameState);
      
      if (!gameState) {
        console.log("GamePlayScreen: No game state available, navigating back to GameSetup");
        navigation.replace('GameSetup');
      } else {
        console.log("GamePlayScreen: Valid game state found:", gameState);
        setLocalGameState(gameState);
      }
    }, [gameState, route.params?.gameState, contextGameState, navigation])
  );

  // Handle game over
  useEffect(() => {
    if (gameState?.gameOver) {
      Alert.alert(
        'Game Over',
        gameState.winner 
          ? `${gameState.winner.name} wins with a score of ${gameState.winner.score}!` 
          : 'Game over!',
        [
          { 
            text: 'New Game', 
            onPress: () => {
              resetGame();
              navigation.replace('GameSetup');
            } 
          },
          {
            text: 'View Results',
            style: 'cancel',
          }
        ]
      );
    }
  }, [gameState?.gameOver, gameState?.winner, navigation, resetGame]);

  const handlePinSelection = (pin: number) => {
    // If the pin is already selected, deselect it
    if (selectedPin === pin) {
      setSelectedPin(null);
    } else {
      // Otherwise, select the new pin
      setSelectedPin(pin);
    }
  };

  const handleScoreSubmit = () => {
    // If no pin is selected, score is 0
    const score = selectedPin !== null ? selectedPin : 0;
    console.log("Submitting score:", score);
    
    // Update the player's score
    updatePlayerScore(score);
    
    // Reset selected pin after scoring
    setSelectedPin(null);
  };

  const handleCameraPress = () => {
    navigation.navigate('Camera');
  };

  if (!gameState || !gameState.players || gameState.players.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.noGameText, { color: colors.text }]}>No active game found.</Text>
        <TouchableOpacity
          style={[styles.newGameButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.replace('GameSetup')}
        >
          <Text style={styles.newGameButtonText}>Start New Game</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activePlayer = getActivePlayer(gameState);
  const playerRankings = getPlayerRanking(gameState.players);

  // Define the pins in a triangle layout (Mölkky style)
  const firstRowPins = [1, 2];
  const secondRowPins = [3, 4, 5];
  const thirdRowPins = [6, 7, 8, 9];
  const fourthRowPins = [10, 11, 12];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Current Player Section */}
      <View style={styles.currentPlayerSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Current Player</Text>
        {activePlayer ? (
          <View style={[styles.activePlayerCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.playerName, { color: colors.text }]}>{activePlayer.name}</Text>
            <Text style={[styles.playerScore, { color: colors.text }]}>Score: {activePlayer.score}</Text>
            <Text style={[styles.playerInfo, { color: colors.text + '99' }]}>
              {activePlayer.consecutiveMisses > 0 
                ? `Consecutive Misses: ${activePlayer.consecutiveMisses}` 
                : 'No consecutive misses'}
            </Text>
          </View>
        ) : (
          <Text style={[styles.noActivePlayer, { color: colors.text }]}>No active player</Text>
        )}
      </View>

      {/* Score Buttons or Camera Button */}
      <View style={styles.actionSection}>
        {showScoreButtons ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Pin</Text>
            <View style={styles.scoreButtonsContainer}>
              {/* First row */}
              <View style={styles.scoreButtonsRow}>
                {firstRowPins.map(pin => (
                  <ScoreButton 
                    key={pin}
                    value={pin} 
                    onPress={() => handlePinSelection(pin)} 
                    color={selectedPin === pin ? colors.accent : colors.primary} 
                  />
                ))}
              </View>
              
              {/* Second row */}
              <View style={styles.scoreButtonsRow}>
                {secondRowPins.map(pin => (
                  <ScoreButton 
                    key={pin}
                    value={pin} 
                    onPress={() => handlePinSelection(pin)} 
                    color={selectedPin === pin ? colors.accent : colors.primary} 
                  />
                ))}
              </View>
              
              {/* Third row */}
              <View style={styles.scoreButtonsRow}>
                {thirdRowPins.map(pin => (
                  <ScoreButton 
                    key={pin}
                    value={pin} 
                    onPress={() => handlePinSelection(pin)} 
                    color={selectedPin === pin ? colors.accent : colors.primary} 
                  />
                ))}
              </View>
              
              {/* Fourth row */}
              <View style={styles.scoreButtonsRow}>
                {fourthRowPins.map(pin => (
                  <ScoreButton 
                    key={pin}
                    value={pin} 
                    onPress={() => handlePinSelection(pin)} 
                    color={selectedPin === pin ? colors.accent : colors.primary} 
                  />
                ))}
              </View>
            </View>
            
            {/* Score Submit Button */}
            <TouchableOpacity
              style={[styles.scoreSubmitButton, { backgroundColor: colors.accent }]}
              onPress={handleScoreSubmit}
            >
              <Text style={styles.scoreSubmitButtonText}>
                Score {selectedPin !== null ? selectedPin : '0'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.cameraButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowScoreButtons(false)}
            >
              <Ionicons name="camera-outline" size={24} color="white" />
              <Text style={styles.cameraButtonText}>Use Camera</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.cameraButton, { backgroundColor: colors.primary }]}
              onPress={handleCameraPress}
            >
              <Ionicons name="camera-outline" size={24} color="white" />
              <Text style={styles.cameraButtonText}>Open Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cameraButton, { backgroundColor: colors.primary, marginTop: 10 }]}
              onPress={() => setShowScoreButtons(true)}
            >
              <Ionicons name="keypad-outline" size={24} color="white" />
              <Text style={styles.cameraButtonText}>Manual Entry</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Player Rankings */}
      <View style={styles.rankingsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Player Rankings</Text>
        <FlatList
          data={playerRankings}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <PlayerScoreCard
              player={item}
              rank={index + 1}
              isActive={item.isActive}
              isEliminated={item.isEliminated}
              colors={colors}
            />
          )}
          style={styles.rankingsList}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  currentPlayerSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  activePlayerCard: {
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  playerName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  playerScore: {
    fontSize: 18,
    marginBottom: 4,
  },
  playerInfo: {
    fontSize: 14,
  },
  noActivePlayer: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  actionSection: {
    marginBottom: 16,
  },
  scoreButtonsContainer: {
    marginBottom: 16,
  },
  scoreButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scoreSubmitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  scoreSubmitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cameraButton: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  cameraButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  rankingsSection: {
    flex: 1,
  },
  rankingsList: {
    flex: 1,
  },
  noGameText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  newGameButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newGameButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GamePlayScreen;
