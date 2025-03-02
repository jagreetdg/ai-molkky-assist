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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Player } from '../types';
import { getActivePlayer, getPlayerRanking } from '../services/gameService';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import ScoreButton from '../components/ScoreButton';
import PlayerScoreCard from '../components/PlayerScoreCard';

type GamePlayScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GamePlay'>;

const GamePlayScreen = () => {
  const navigation = useNavigation<GamePlayScreenNavigationProp>();
  const { colors } = useTheme();
  const { gameState, updatePlayerScore, resetGame } = useGame();
  const [showScoreButtons, setShowScoreButtons] = useState(true);

  // Check game state when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (!gameState || !gameState.players || gameState.players.length === 0) {
        navigation.replace('GameSetup');
      }
    }, [gameState, navigation])
  );

  // Handle game over
  useEffect(() => {
    if (gameState?.gameOver) {
      Alert.alert(
        'Game Over',
        gameState.winner 
          ? `${gameState.winner.name} has won!` 
          : 'Game Over!',
        [
          {
            text: 'New Game',
            onPress: () => {
              resetGame();
              navigation.replace('GameSetup');
            }
          },
          {
            text: 'Back to Home',
            onPress: () => {
              resetGame();
              navigation.replace('Home');
            }
          }
        ],
        { cancelable: false }
      );
    }
  }, [gameState?.gameOver, navigation, resetGame]);

  if (!gameState || !gameState.players || gameState.players.length === 0) {
    return null;
  }

  const handleScore = (score: number) => {
    updatePlayerScore(score);
    setShowScoreButtons(false);
  };

  const handleNextTurn = () => {
    setShowScoreButtons(true);
  };

  const handleEndGame = () => {
    Alert.alert(
      'End Game',
      'Are you sure you want to end the current game?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'End Game',
          style: 'destructive',
          onPress: () => {
            resetGame();
            navigation.replace('Home');
          }
        }
      ]
    );
  };

  const handleTakePhoto = () => {
    navigation.navigate('Camera');
  };

  const activePlayer = getActivePlayer(gameState);
  const rankedPlayers = getPlayerRanking(gameState.players);

  const renderScoreButtons = () => {
    const buttons = [];
    // Add miss button
    buttons.push(
      <ScoreButton
        key="miss"
        value={0}
        onPress={() => handleScore(0)}
        isMiss
      />
    );
    // Add number buttons 1-12
    for (let i = 1; i <= 12; i++) {
      buttons.push(
        <ScoreButton
          key={i}
          value={i}
          onPress={() => handleScore(i)}
        />
      );
    }
    return buttons;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.endGameButton, { backgroundColor: colors.error }]}
          onPress={handleEndGame}
        >
          <Text style={styles.endGameButtonText}>End Game</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.photoButton, { backgroundColor: colors.primary }]}
          onPress={handleTakePhoto}
        >
          <Ionicons name="camera" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.gameInfo}>
        <Text style={[styles.roundText, { color: colors.text }]}>
          Round {gameState.round}
        </Text>
        {activePlayer && (
          <Text style={[styles.playerText, { color: colors.text }]}>
            Current Player: <Text style={{ color: colors.primary }}>{activePlayer.name}</Text>
          </Text>
        )}
      </View>

      <View style={styles.playersContainer}>
        <FlatList
          data={rankedPlayers}
          keyExtractor={(player) => player.id}
          renderItem={({ item: player }) => (
            <PlayerScoreCard
              player={player}
              isActive={player.id === activePlayer?.id}
            />
          )}
        />
      </View>

      {showScoreButtons ? (
        <View style={styles.scoreButtonsContainer}>
          <View style={styles.scoreButtonsGrid}>
            {renderScoreButtons()}
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: colors.success }]}
          onPress={handleNextTurn}
        >
          <Text style={styles.nextButtonText}>Next Turn</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  endGameButton: {
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  endGameButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  photoButton: {
    padding: 10,
    borderRadius: 8,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameInfo: {
    marginBottom: 16,
  },
  roundText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerText: {
    fontSize: 16,
    marginTop: 4,
  },
  playersContainer: {
    flex: 1,
    marginBottom: 16,
  },
  scoreButtonsContainer: {
    padding: 8,
  },
  scoreButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  nextButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GamePlayScreen;
