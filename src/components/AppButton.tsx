import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: string;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  fullWidth?: boolean;
}

const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
  fullWidth = false,
}) => {
  const { colors } = useTheme();

  // Get button colors based on variant
  const getButtonStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.info,
          textColor: 'white',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          textColor: colors.primary,
          borderColor: colors.primary,
          borderWidth: 2,
        };
      case 'danger':
        return {
          backgroundColor: colors.error,
          textColor: 'white',
        };
      case 'success':
        return {
          backgroundColor: colors.success,
          textColor: 'white',
        };
      case 'warning':
        return {
          backgroundColor: colors.warning,
          textColor: '#1a1a1a',
        };
      case 'primary':
      default:
        return {
          backgroundColor: colors.primary,
          textColor: 'white',
        };
    }
  };

  const buttonStyles = getButtonStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: buttonStyles.backgroundColor },
        buttonStyles.borderWidth ? { borderWidth: buttonStyles.borderWidth } : undefined,
        buttonStyles.borderColor ? { borderColor: buttonStyles.borderColor } : undefined,
        disabled && { opacity: 0.6 },
        fullWidth && { width: '100%' },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityLabel={accessibilityLabel || title}
    >
      <View style={styles.contentContainer}>
        {icon && iconPosition === 'left' && (
          <Ionicons
            name={icon as any}
            size={20}
            color={buttonStyles.textColor}
            style={styles.leftIcon}
          />
        )}
        <Text
          style={[
            styles.text,
            { color: buttonStyles.textColor },
            textStyle,
          ]}
        >
          {title}
        </Text>
        {icon && iconPosition === 'right' && (
          <Ionicons
            name={icon as any}
            size={20}
            color={buttonStyles.textColor}
            style={styles.rightIcon}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 8,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

export default AppButton;
