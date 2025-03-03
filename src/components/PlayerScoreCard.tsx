import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Player } from '../types';
import { useTheme } from '../context/ThemeContext';

interface PlayerScoreCardProps {
  player: Player;
  isActive?: boolean;
  isEliminated?: boolean;
  rank?: number;
  colors?: any;
}

const PlayerScoreCard: React.FC<PlayerScoreCardProps> = ({ 
  player, 
  isActive = false,
  isEliminated = player.score === -1,
  rank,
  colors: propColors
}) => {
  const themeContext = useTheme();
  const colors = propColors || themeContext.colors;
  
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
      {rank && (
        <View style={[styles.rankBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>
      )}
      <View style={styles.playerInfo}>
        <Text style={[
          styles.playerName,
          { color: colors.text },
          isActive && { color: colors.primary },
          isEliminated && styles.eliminatedText
        ]}>
          {player.name}
        </Text>
        <View style={styles.scoreContainer}>
          <Text style={[
            styles.score, 
            { 
              color: isEliminated ? colors.error : colors.text 
            }
          ]}>
            {isEliminated ? 'X' : player.score}
          </Text>
          {!isEliminated && player.consecutiveMisses > 0 && (
            <Text style={[styles.missText, { color: colors.error }]}>
              Misses: {player.consecutiveMisses}/3
            </Text>
          )}
        </View>
      </View>
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
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  missText: {
    fontSize: 14,
    marginLeft: 8,
  },
  eliminatedText: {
    textDecorationLine: 'line-through',
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default PlayerScoreCard;
