import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Switch, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Settings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  darkMode: boolean;
  autoSaveGames: boolean;
  targetScore: number;
}

const SettingsScreen = () => {
  const [settings, setSettings] = useState<Settings>({
    soundEnabled: true,
    vibrationEnabled: true,
    darkMode: false,
    autoSaveGames: true,
    targetScore: 50,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const toggleSetting = (key: keyof Settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const setTargetScore = (score: number) => {
    const newSettings = { ...settings, targetScore: score };
    saveSettings(newSettings);
  };

  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const defaultSettings = {
              soundEnabled: true,
              vibrationEnabled: true,
              darkMode: false,
              autoSaveGames: true,
              targetScore: 50,
            };
            saveSettings(defaultSettings);
          },
        },
      ]
    );
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://www.example.com/privacy-policy');
  };

  const renderSettingSwitch = (
    title: string,
    description: string,
    value: boolean,
    onToggle: () => void,
    icon: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={24} color="#3498db" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#bdc3c7', true: '#3498db' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Game Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Ionicons name="flag" size={24} color="#3498db" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Target Score</Text>
            <Text style={styles.settingDescription}>
              Set the winning score for the game
            </Text>
          </View>
          <View style={styles.scoreButtonsContainer}>
            {[25, 50, 75].map((score) => (
              <TouchableOpacity
                key={score}
                style={[
                  styles.scoreButton,
                  settings.targetScore === score && styles.activeScoreButton,
                ]}
                onPress={() => setTargetScore(score)}
              >
                <Text
                  style={[
                    styles.scoreButtonText,
                    settings.targetScore === score && styles.activeScoreButtonText,
                  ]}
                >
                  {score}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {renderSettingSwitch(
          'Auto-save Games',
          'Automatically save completed games to history',
          settings.autoSaveGames,
          () => toggleSetting('autoSaveGames'),
          'save-outline'
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        {renderSettingSwitch(
          'Sound Effects',
          'Enable sound effects in the app',
          settings.soundEnabled,
          () => toggleSetting('soundEnabled'),
          'volume-high-outline'
        )}
        
        {renderSettingSwitch(
          'Vibration',
          'Enable haptic feedback',
          settings.vibrationEnabled,
          () => toggleSetting('vibrationEnabled'),
          'phone-portrait-outline'
        )}
        
        {renderSettingSwitch(
          'Dark Mode',
          'Use dark color theme (requires app restart)',
          settings.darkMode,
          () => toggleSetting('darkMode'),
          'moon-outline'
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity style={styles.aboutItem} onPress={openPrivacyPolicy}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#3498db" />
          <Text style={styles.aboutText}>Privacy Policy</Text>
        </TouchableOpacity>
        
        <View style={styles.aboutItem}>
          <Ionicons name="information-circle-outline" size={24} color="#3498db" />
          <Text style={styles.aboutText}>Version 1.0.0</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
        <Text style={styles.resetButtonText}>Reset to Default Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#3498db',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  scoreButtonsContainer: {
    flexDirection: 'row',
  },
  scoreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  activeScoreButton: {
    backgroundColor: '#3498db',
  },
  scoreButtonText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  activeScoreButtonText: {
    color: 'white',
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  aboutText: {
    fontSize: 16,
    marginLeft: 15,
  },
  resetButton: {
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SettingsScreen;
