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
import MissIndicator from '../components/MissIndicator';

type GamePlayScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GamePlay'>;
type GamePlayScreenRouteProp = RouteProp<RootStackParamList, 'GamePlay'>;

interface GamePlayScreenProps {
  route: GamePlayScreenRouteProp;
}

const GamePlayScreen = ({ route }: GamePlayScreenProps) => {
  const navigation = useNavigation<GamePlayScreenNavigationProp>();
  const { colors } = useTheme();
  const { gameState: contextGameState, updatePlayerScore, resetGame, undoLastMove } = useGame();
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

  const handleUndoPress = () => {
    undoLastMove();
  };

  const handleResetPress = () => {
    Alert.alert(
      "Reset Game",
      "Are you sure you want to reset the entire game? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Reset", 
          onPress: () => resetGame(),
          style: "destructive"
        }
      ]
    );
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

  // Define the pins in the actual Mölkky board layout
  // Front row (closest to the player)
  const frontRow = [7, 9, 8];
  // Second row
  const secondRow = [5, 11, 12, 6];
  // Third row
  const thirdRow = [3, 10, 4];
  // Back row (furthest from the player)
  const backRow = [1, 2];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Current Player Section */}
      <View style={styles.currentPlayerSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Current Player</Text>
        </View>
        {activePlayer ? (
          <View style={[styles.activePlayerCard, { backgroundColor: colors.card }]}>
            <View style={styles.activePlayerHeader}>
              <Text style={[styles.playerName, { color: colors.text }]}>{activePlayer.name}</Text>
              <MissIndicator 
                consecutiveMisses={activePlayer.consecutiveMisses} 
                size="medium" 
                colors={colors}
              />
            </View>
            <Text style={[styles.playerScore, { color: colors.text }]}>Score: {activePlayer.score}</Text>
          </View>
        ) : (
          <Text style={[styles.noActivePlayer, { color: colors.text }]}>No active player</Text>
        )}
      </View>

      {/* Score Buttons or Camera Button */}
      <View style={styles.actionSection}>
        {showScoreButtons ? (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Pin</Text>
            </View>
            <View style={styles.scoreButtonsContainer}>
              {/* Front row */}
              <View style={styles.scoreButtonsRow}>
                {frontRow.map(pin => (
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
                {secondRow.map(pin => (
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
                {thirdRow.map(pin => (
                  <ScoreButton 
                    key={pin}
                    value={pin} 
                    onPress={() => handlePinSelection(pin)} 
                    color={selectedPin === pin ? colors.accent : colors.primary} 
                  />
                ))}
              </View>
              
              {/* Back row */}
              <View style={styles.scoreButtonsRow}>
                {backRow.map(pin => (
                  <ScoreButton 
                    key={pin}
                    value={pin} 
                    onPress={() => handlePinSelection(pin)} 
                    color={selectedPin === pin ? colors.accent : colors.primary} 
                  />
                ))}
              </View>
            </View>
            
            {/* Action Buttons Row */}
            <View style={styles.actionButtonsRow}>
              {/* Score Submit Button */}
              <TouchableOpacity
                style={[styles.scoreSubmitButton, { backgroundColor: colors.success, flex: 2 }]}
                onPress={handleScoreSubmit}
              >
                <Text style={styles.scoreSubmitButtonText}>
                  Score {selectedPin !== null ? selectedPin : '0'}
                </Text>
              </TouchableOpacity>
              
              {/* Undo Button */}
              <TouchableOpacity
                style={[styles.undoButton, { backgroundColor: colors.warning, flex: 1 }]}
                onPress={handleUndoPress}
              >
                <Ionicons name="arrow-undo" size={24} color="white" />
              </TouchableOpacity>
              
              {/* Reset Button */}
              <TouchableOpacity
                style={[styles.resetButton, { backgroundColor: colors.error, flex: 1 }]}
                onPress={handleResetPress}
              >
                <Ionicons name="refresh" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            {/* Camera Button Row */}
            <View style={styles.cameraButtonRow}>
              <TouchableOpacity
                style={[styles.cameraButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowScoreButtons(false)}
              >
                <Ionicons name="camera-outline" size={24} color="white" />
                <Text style={styles.cameraButtonText}>Analyze with AI</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          // Camera view
          <>
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={[styles.cameraButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowScoreButtons(true)}
              >
                <Ionicons name="keypad-outline" size={24} color="white" />
                <Text style={styles.cameraButtonText}>Manual Entry</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Player Rankings */}
      <View style={styles.rankingsSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Player Rankings</Text>
        </View>
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
          contentContainerStyle={styles.rankingsListContent}
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
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
  activePlayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  playerScore: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  actionSection: {
    marginBottom: 12,
  },
  scoreButtonsContainer: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scoreSubmitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    marginRight: 10,
  },
  scoreSubmitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  undoButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    marginRight: 10,
  },
  resetButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  cameraButtonRow: {
    marginBottom: 16,
  },
  cameraButton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  rankingsSection: {
    flex: 1,
  },
  rankingsList: {
    flex: 1,
  },
  rankingsListContent: {
    paddingTop: 8,
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
  noActivePlayer: {
    fontSize: 16,
    fontStyle: 'italic',
  },
});

export default GamePlayScreen;
