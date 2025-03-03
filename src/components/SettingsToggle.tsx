import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface SettingsToggleProps {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  iconName?: string;
  disabled?: boolean;
}

const SettingsToggle: React.FC<SettingsToggleProps> = ({
  title,
  description,
  value,
  onValueChange,
  iconName,
  disabled = false,
}) => {
  const { colors } = useTheme();
  
  return (
    <View style={[
      styles.container,
      { borderBottomColor: colors.border },
      disabled && { opacity: 0.6 }
    ]}>
      <View style={styles.leftContent}>
        {iconName && (
          <Ionicons
            name={iconName as any}
            size={24}
            color={colors.primary}
            style={styles.icon}
          />
        )}
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {description && (
            <Text style={[styles.description, { color: colors.text + '99' }]}>
              {description}
            </Text>
          )}
        </View>
      </View>
      
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#767577', true: colors.primary + '80' }}
        thumbColor={value ? colors.primary : '#f4f3f4'}
        ios_backgroundColor="#767577"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default SettingsToggle;
