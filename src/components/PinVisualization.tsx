import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PinState } from '../types';
import { useTheme } from '../context/ThemeContext';

interface PinVisualizationProps {
  pins: PinState[];
  highlightedPins?: number[];
  containerWidth?: number;
}

const PinVisualization: React.FC<PinVisualizationProps> = ({
  pins,
  highlightedPins = [],
  containerWidth,
}) => {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const width = containerWidth || screenWidth - 40; // Default with some padding
  
  // Default pin layout for a standard Mölkky game (if no positions provided)
  const defaultPinPositions = [
    { number: 1, x: width * 0.5, y: width * 0.2 },
    { number: 2, x: width * 0.4, y: width * 0.3 },
    { number: 3, x: width * 0.6, y: width * 0.3 },
    { number: 4, x: width * 0.3, y: width * 0.4 },
    { number: 5, x: width * 0.5, y: width * 0.4 },
    { number: 6, x: width * 0.7, y: width * 0.4 },
    { number: 7, x: width * 0.2, y: width * 0.5 },
    { number: 8, x: width * 0.4, y: width * 0.5 },
    { number: 9, x: width * 0.6, y: width * 0.5 },
    { number: 10, x: width * 0.8, y: width * 0.5 },
    { number: 11, x: width * 0.3, y: width * 0.6 },
    { number: 12, x: width * 0.7, y: width * 0.6 },
  ];
  
  // If pins have positions, use them; otherwise use default positions
  const pinsWithPositions = pins.map(pin => {
    if (pin.position && pin.position.x !== undefined && pin.position.y !== undefined) {
      return pin;
    } else {
      const defaultPosition = defaultPinPositions.find(p => p.number === pin.number);
      return {
        ...pin,
        position: {
          x: defaultPosition?.x || 0,
          y: defaultPosition?.y || 0,
        },
      };
    }
  });
  
  return (
    <View style={[styles.container, { width, height: width * 0.8 }]}>
      {pinsWithPositions.map(pin => {
        const isHighlighted = highlightedPins.includes(pin.number);
        const isStanding = pin.isStanding;
        
        let backgroundColor;
        if (!isStanding) {
          backgroundColor = colors.error;
        } else if (isHighlighted) {
          backgroundColor = colors.success;
        } else {
          backgroundColor = colors.primary;
        }
        
        return (
          <View
            key={pin.number}
            style={[
              styles.pin,
              {
                left: pin.position.x - 20, // Center the pin (40px width / 2)
                top: pin.position.y - 20, // Center the pin (40px height / 2)
                backgroundColor,
                borderColor: colors.card,
                opacity: isStanding ? 1 : 0.5,
              },
            ]}
          >
            <Text style={styles.pinNumber}>{pin.number}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  pin: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pinNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PinVisualization;
