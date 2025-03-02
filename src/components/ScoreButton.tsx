import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ScoreButtonProps {
  value: number;
  onPress: () => void;
  isMiss?: boolean;
  disabled?: boolean;
}

const ScoreButton: React.FC<ScoreButtonProps> = ({ 
  value, 
  onPress, 
  isMiss = false,
  disabled = false 
}) => {
  const { colors } = useTheme();
  
  const backgroundColor = isMiss 
    ? colors.error 
    : colors.primary;
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor },
        disabled && styles.disabledButton
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={isMiss ? 'Miss' : `Score ${value}`}
    >
      <Text style={styles.buttonText}>
        {isMiss ? 'Miss' : value}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ScoreButton;
