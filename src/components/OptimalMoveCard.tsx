import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OptimalMove } from '../types';
import { useTheme } from '../context/ThemeContext';
import PinVisualization from './PinVisualization';

interface OptimalMoveCardProps {
  optimalMove: OptimalMove;
  currentPlayerName: string;
  targetScore: number;
}

const OptimalMoveCard: React.FC<OptimalMoveCardProps> = ({
  optimalMove,
  currentPlayerName,
  targetScore,
}) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Optimal Move</Text>
      
      <View style={styles.playerInfo}>
        <Text style={[styles.playerText, { color: colors.text }]}>
          <Text style={{ fontWeight: 'bold' }}>{currentPlayerName}</Text> is {targetScore - optimalMove.currentScore} points away from winning
        </Text>
      </View>
      
      <View style={styles.recommendationContainer}>
        <Text style={[styles.recommendationTitle, { color: colors.text }]}>
          Recommendation:
        </Text>
        
        <Text style={[styles.recommendationText, { color: colors.success }]}>
          {optimalMove.recommendation}
        </Text>
      </View>
      
      {optimalMove.targetPins.length > 0 && (
        <View style={styles.targetPinsContainer}>
          <Text style={[styles.targetPinsTitle, { color: colors.text }]}>
            Target {optimalMove.targetPins.length > 1 ? 'Pins' : 'Pin'}:
          </Text>
          
          <View style={styles.pinsContainer}>
            <PinVisualization
              pins={optimalMove.availablePins}
              highlightedPins={optimalMove.targetPins}
              containerWidth={280}
            />
          </View>
          
          <Text style={[styles.targetPinsText, { color: colors.info }]}>
            {optimalMove.targetPins.length > 1
              ? `Aim to knock down ${optimalMove.targetPins.length} pins for ${optimalMove.targetPins.length} points`
              : `Aim to knock down pin #${optimalMove.targetPins[0]} for ${optimalMove.targetPins[0]} points`}
          </Text>
        </View>
      )}
      
      <View style={styles.strategyContainer}>
        <Text style={[styles.strategyTitle, { color: colors.text }]}>
          Strategy:
        </Text>
        
        <Text style={[styles.strategyText, { color: colors.text }]}>
          {optimalMove.strategyExplanation}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  playerInfo: {
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  playerText: {
    fontSize: 16,
    textAlign: 'center',
  },
  recommendationContainer: {
    marginBottom: 16,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  targetPinsContainer: {
    marginBottom: 16,
  },
  targetPinsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pinsContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  targetPinsText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  strategyContainer: {
    marginTop: 8,
  },
  strategyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  strategyText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default OptimalMoveCard;
