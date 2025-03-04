import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface AnimatedContainerProps {
  children: React.ReactNode;
  index?: number;
  delay?: number;
  style?: ViewStyle;
}

const AnimatedContainer = ({ 
  children, 
  index = 0, 
  delay = 100,
  style 
}: AnimatedContainerProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;

  useEffect(() => {
    const totalDelay = index * delay;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: totalDelay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: totalDelay,
        useNativeDriver: true,
      })
    ]).start();
  }, [index, delay, fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          marginBottom: 16,
        },
        style
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default AnimatedContainer;
