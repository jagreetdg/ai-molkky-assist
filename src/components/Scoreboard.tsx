import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Player } from '../types';
import { useTheme } from '../context/ThemeContext';

interface ScoreboardProps {
  players: Player[];
  round: number;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ players, round }) => {
  const { colors, isDarkMode } = useTheme();
  
  const sortedPlayers = [...players].sort((a, b) => {
    // Sort by active status first
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    
    // Then sort by score (descending)
    return b.score - a.score;
  });
  
  const renderPlayerItem = ({ item }: { item: Player }) => {
    const isActive = item.isActive;
    const isEliminated = item.score === -1;
    
    return (
      <View style={[
        styles.playerItem,
        {
          backgroundColor: isActive ? colors.primary + '20' : colors.card,
          borderColor: isActive ? colors.primary : colors.border,
        },
        isEliminated && { opacity: 0.6 }
      ]}>
        <Text style={[
          styles.playerName,
          { color: colors.text },
          isActive && { color: colors.primary, fontWeight: 'bold' },
          isEliminated && styles.eliminatedText
        ]}>
          {item.name}
        </Text>
        <Text style={[
          styles.playerScore,
          { color: colors.text },
          isActive && { color: colors.primary, fontWeight: 'bold' },
          isEliminated && styles.eliminatedText
        ]}>
          {isEliminated ? 'X' : item.score}
        </Text>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.roundText, { color: colors.primary }]}>
          Round {round}
        </Text>
        <Text style={[styles.scoreboardTitle, { color: colors.text }]}>
          Scoreboard
        </Text>
      </View>
      
      <FlatList
        data={sortedPlayers}
        keyExtractor={(item) => item.id}
        renderItem={renderPlayerItem}
        style={styles.playerList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 10,
  },
  roundText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  playerList: {
    flex: 1,
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  playerScore: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eliminatedText: {
    textDecorationLine: 'line-through',
  },
});

export default Scoreboard;
