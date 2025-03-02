import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface HistoryItemProps {
  id: string;
  date: string;
  players: string[];
  winner: string | null;
  rounds: number;
  finalScores: { name: string; score: number }[];
  onPress?: () => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
  date,
  players,
  winner,
  rounds,
  finalScores,
  onPress,
}) => {
  const { colors } = useTheme();
  
  // Sort final scores by score (descending)
  const sortedScores = [...finalScores].sort((a, b) => b.score - a.score);
  
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Text style={[styles.date, { color: colors.text + '99' }]}>{date}</Text>
        <Text style={[styles.rounds, { color: colors.text + '99' }]}>
          {rounds} {rounds === 1 ? 'round' : 'rounds'}
        </Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.winnerContainer}>
          {winner ? (
            <>
              <Ionicons name="trophy" size={20} color={colors.warning} style={styles.trophyIcon} />
              <Text style={[styles.winnerText, { color: colors.success }]}>
                {winner} won!
              </Text>
            </>
          ) : (
            <Text style={[styles.noWinnerText, { color: colors.error }]}>
              No winner
            </Text>
          )}
        </View>
        
        <View style={styles.playersContainer}>
          <Text style={[styles.playersLabel, { color: colors.text }]}>
            Players ({players.length}):
          </Text>
          <Text style={[styles.playersText, { color: colors.text }]}>
            {players.join(', ')}
          </Text>
        </View>
      </View>
      
      <View style={styles.scoresContainer}>
        {sortedScores.slice(0, 3).map((score, index) => (
          <View 
            key={score.name} 
            style={[
              styles.scoreItem,
              index < 2 && styles.scoreItemWithBorder,
              { borderRightColor: colors.border }
            ]}
          >
            <Text style={[styles.playerName, { color: colors.text }]}>
              {score.name}
            </Text>
            <Text 
              style={[
                styles.playerScore, 
                { color: winner === score.name ? colors.success : colors.text }
              ]}
            >
              {score.score}
            </Text>
          </View>
        ))}
      </View>
      
      {onPress && (
        <View style={styles.viewDetailsContainer}>
          <Text style={[styles.viewDetailsText, { color: colors.primary }]}>
            View details
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  date: {
    fontSize: 12,
  },
  rounds: {
    fontSize: 12,
  },
  content: {
    padding: 12,
  },
  winnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trophyIcon: {
    marginRight: 6,
  },
  winnerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noWinnerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  playersContainer: {
    marginTop: 4,
  },
  playersLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  playersText: {
    fontSize: 14,
  },
  scoresContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  scoreItem: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  scoreItemWithBorder: {
    borderRightWidth: 1,
  },
  playerName: {
    fontSize: 12,
    marginBottom: 2,
  },
  playerScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  viewDetailsText: {
    fontSize: 14,
    marginRight: 4,
  },
});

export default HistoryItem;
