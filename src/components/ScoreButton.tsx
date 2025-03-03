import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ScoreButtonProps {
  value: number;
  onPress: () => void;
  isMiss?: boolean;
  disabled?: boolean;
  color?: string;
  selected?: boolean;
}

const ScoreButton: React.FC<ScoreButtonProps> = ({ 
  value, 
  onPress, 
  isMiss = false,
  disabled = false,
  color,
  selected = false
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
        disabled && { opacity: 0.5 },
        selected && styles.selectedButton
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={isMiss ? 'Miss' : `Score ${value}`}
    >
      <View style={styles.pinContainer}>
        <Text style={styles.buttonText}>
          {isMiss ? 'Miss' : value}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
    margin: 4,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  selectedButton: {
    borderColor: 'white',
    borderWidth: 2,
  },
  pinContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ScoreButton;
