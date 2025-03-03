import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ScoreButtonProps {
  value: number;
  onPress: () => void;
  isMiss?: boolean;
  disabled?: boolean;
  color?: string;
}

const ScoreButton: React.FC<ScoreButtonProps> = ({ 
  value, 
  onPress, 
  isMiss = false,
  disabled = false,
  color
}) => {
  const { colors } = useTheme();
  
  const backgroundColor = color 
    ? color 
    : isMiss 
      ? colors.error 
      : colors.primary;
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor },
        disabled && { opacity: 0.5 }
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
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ScoreButton;
