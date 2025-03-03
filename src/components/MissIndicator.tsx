import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface MissIndicatorProps {
  consecutiveMisses: number;
  size?: 'small' | 'medium' | 'large';
  colors?: any;
}

const MissIndicator: React.FC<MissIndicatorProps> = ({ 
  consecutiveMisses, 
  size = 'medium',
  colors: propColors 
}) => {
  const themeContext = useTheme();
  const colors = propColors || themeContext.colors;
  
  // Determine dot size based on the size prop
  const dotSize = size === 'small' ? 8 : size === 'medium' ? 10 : 12;
  const dotSpacing = size === 'small' ? 4 : size === 'medium' ? 6 : 8;
  
  return (
    <View style={styles.container}>
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              marginHorizontal: dotSpacing / 2,
              backgroundColor: index < consecutiveMisses ? colors.error : colors.success
            }
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    margin: 2,
  }
});

export default MissIndicator;
