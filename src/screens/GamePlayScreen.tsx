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
  
  // Use the game state from route params if available, otherwise use context
  const gameState = route.params?.gameState || contextGameState;

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
      }
    }, [gameState, route.params?.gameState, contextGameState])
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

  const handleScoreButtonPress = (score: number) => {
    updatePlayerScore(score);
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Enter Score</Text>
            <View style={styles.scoreButtonsContainer}>
              <View style={styles.scoreButtonsRow}>
                <ScoreButton value={0} onPress={() => handleScoreButtonPress(0)} color={colors.primary} />
                <ScoreButton value={1} onPress={() => handleScoreButtonPress(1)} color={colors.primary} />
                <ScoreButton value={2} onPress={() => handleScoreButtonPress(2)} color={colors.primary} />
                <ScoreButton value={3} onPress={() => handleScoreButtonPress(3)} color={colors.primary} />
              </View>
              <View style={styles.scoreButtonsRow}>
                <ScoreButton value={4} onPress={() => handleScoreButtonPress(4)} color={colors.primary} />
                <ScoreButton value={5} onPress={() => handleScoreButtonPress(5)} color={colors.primary} />
                <ScoreButton value={6} onPress={() => handleScoreButtonPress(6)} color={colors.primary} />
                <ScoreButton value={7} onPress={() => handleScoreButtonPress(7)} color={colors.primary} />
              </View>
              <View style={styles.scoreButtonsRow}>
                <ScoreButton value={8} onPress={() => handleScoreButtonPress(8)} color={colors.primary} />
                <ScoreButton value={9} onPress={() => handleScoreButtonPress(9)} color={colors.primary} />
                <ScoreButton value={10} onPress={() => handleScoreButtonPress(10)} color={colors.primary} />
                <ScoreButton value={12} onPress={() => handleScoreButtonPress(12)} color={colors.primary} />
              </View>
            </View>
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  activePlayerCard: {
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  playerName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  playerScore: {
    fontSize: 18,
    marginTop: 5,
  },
  playerInfo: {
    fontSize: 14,
    marginTop: 5,
  },
  noActivePlayer: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  actionSection: {
    marginBottom: 20,
  },
  scoreButtonsContainer: {
    marginBottom: 15,
  },
  scoreButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
    marginTop: 50,
    marginBottom: 20,
  },
  newGameButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 50,
  },
  newGameButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GamePlayScreen;
