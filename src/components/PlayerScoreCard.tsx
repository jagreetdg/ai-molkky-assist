import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Player } from '../types';
import { useTheme } from '../context/ThemeContext';

interface PlayerScoreCardProps {
  player: Player;
  isActive: boolean;
}

const PlayerScoreCard: React.FC<PlayerScoreCardProps> = ({ player, isActive }) => {
  const { colors } = useTheme();
  const isEliminated = player.score === -1;
  
  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: colors.card,
        borderColor: isActive ? colors.primary : colors.border 
      },
      isActive && styles.activeContainer,
      isEliminated && { opacity: 0.7 }
    ]}>
      <View style={styles.playerInfo}>
        <Text style={[
          styles.playerName,
          { color: colors.text },
          isActive && { color: colors.primary },
          isEliminated && styles.eliminatedText
        ]}>
          {player.name}
        </Text>
        
        {player.consecutiveMisses && player.consecutiveMisses > 0 ? (
          <Text style={[styles.missesText, { color: colors.warning }]}>
            Misses: {player.consecutiveMisses}/3
          </Text>
        ) : null}
      </View>
      
      <Text style={[
        styles.scoreText,
        { color: isActive ? colors.primary : colors.text },
        isEliminated && styles.eliminatedText
      ]}>
        {isEliminated ? 'X' : player.score}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  activeContainer: {
    borderWidth: 2,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  eliminatedText: {
    textDecorationLine: 'line-through',
  },
  missesText: {
    fontSize: 12,
    marginTop: 4,
  }
});

export default PlayerScoreCard;
