import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ScoreInputProps {
  onScoreSelected: (score: number) => void;
}

const ScoreInput: React.FC<ScoreInputProps> = ({ onScoreSelected }) => {
  const { colors } = useTheme();
  
  const renderScoreButton = (value: number) => (
    <TouchableOpacity
      style={[
        styles.scoreButton,
        { backgroundColor: colors.primary }
      ]}
      onPress={() => onScoreSelected(value)}
    >
      <Text style={styles.scoreButtonText}>{value}</Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Enter Score</Text>
      
      <View style={styles.scoreButtonsContainer}>
        <View style={styles.scoreButtonRow}>
          {[1, 2, 3, 4].map(value => (
            <View key={value} style={styles.scoreButtonWrapper}>
              {renderScoreButton(value)}
            </View>
          ))}
        </View>
        
        <View style={styles.scoreButtonRow}>
          {[5, 6, 7, 8].map(value => (
            <View key={value} style={styles.scoreButtonWrapper}>
              {renderScoreButton(value)}
            </View>
          ))}
        </View>
        
        <View style={styles.scoreButtonRow}>
          {[9, 10, 11, 12].map(value => (
            <View key={value} style={styles.scoreButtonWrapper}>
              {renderScoreButton(value)}
            </View>
          ))}
        </View>
        
        <View style={styles.scoreButtonRow}>
          <View style={[styles.scoreButtonWrapper, { flex: 1 }]}>
            <TouchableOpacity
              style={[
                styles.scoreButton,
                styles.missButton,
                { backgroundColor: colors.error }
              ]}
              onPress={() => onScoreSelected(0)}
            >
              <Text style={styles.scoreButtonText}>Miss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scoreButtonsContainer: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  scoreButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scoreButtonWrapper: {
    flex: 1,
    paddingHorizontal: 4,
  },
  scoreButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missButton: {
    backgroundColor: '#e74c3c',
  },
  scoreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ScoreInput;
