import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Player } from '../types';
import { useTheme } from '../context/ThemeContext';
import MissIndicator from './MissIndicator';

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
      </View>
      
      {/* Score and Miss Indicator */}
      <View style={styles.scoreAndMissContainer}>
        <Text style={[
          styles.score, 
          { 
            color: isEliminated ? colors.error : colors.text 
          }
        ]}>
          {isEliminated ? 'X' : player.score}
        </Text>
        <MissIndicator 
          consecutiveMisses={player.consecutiveMisses} 
          size="small" 
          colors={colors}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
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
  scoreAndMissContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  eliminatedText: {
    textDecorationLine: 'line-through',
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rankText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  }
});

export default PlayerScoreCard;
