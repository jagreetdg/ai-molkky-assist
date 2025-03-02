import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Player } from '../types';
import { useTheme } from '../context/ThemeContext';

interface GameResultProps {
  winner: Player | null;
  players: Player[];
  onNewGame: () => void;
  onViewHistory: () => void;
}

const GameResult: React.FC<GameResultProps> = ({
  winner,
  players,
  onNewGame,
  onViewHistory,
}) => {
  const { colors } = useTheme();
  
  // Sort players by score (descending)
  const sortedPlayers = [...players].sort((a, b) => {
    // Handle eliminated players (score -1)
    if (a.score === -1 && b.score !== -1) return 1;
    if (a.score !== -1 && b.score === -1) return -1;
    if (a.score === -1 && b.score === -1) return 0;
    
    // Sort by score
    return b.score - a.score;
  });
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.primary }]}>Game Over</Text>
        
        {winner ? (
          <Text style={[styles.winnerText, { color: colors.success }]}>
            {winner.name} wins!
          </Text>
        ) : (
          <Text style={[styles.winnerText, { color: colors.error }]}>
            No winner! All players eliminated.
          </Text>
        )}
      </View>
      
      <View style={styles.resultsContainer}>
        <Text style={[styles.resultsTitle, { color: colors.text }]}>Final Results</Text>
        
        {sortedPlayers.map((player, index) => (
          <View 
            key={player.id} 
            style={[
              styles.playerRow,
              index === 0 && winner && styles.winnerRow,
              { borderBottomColor: colors.border }
            ]}
          >
            <Text style={[
              styles.position, 
              index === 0 && winner && { color: colors.success },
              { color: player.score === -1 ? colors.error : colors.text }
            ]}>
              {index + 1}
            </Text>
            <Text style={[
              styles.playerName, 
              index === 0 && winner && { color: colors.success, fontWeight: 'bold' },
              { color: player.score === -1 ? colors.error : colors.text }
            ]}>
              {player.name}
            </Text>
            <Text style={[
              styles.playerScore, 
              index === 0 && winner && { color: colors.success, fontWeight: 'bold' },
              { color: player.score === -1 ? colors.error : colors.text }
            ]}>
              {player.score === -1 ? 'X' : player.score}
            </Text>
          </View>
        ))}
      </View>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onNewGame}
        >
          <Text style={styles.buttonText}>New Game</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.info }]}
          onPress={onViewHistory}
        >
          <Text style={styles.buttonText}>View History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  winnerText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  resultsContainer: {
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  playerRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  winnerRow: {
    paddingVertical: 12,
  },
  position: {
    width: 30,
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerName: {
    flex: 1,
    fontSize: 16,
  },
  playerScore: {
    width: 40,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GameResult;
