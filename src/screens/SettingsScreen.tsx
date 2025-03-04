import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Switch, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Linking,
  BackHandler,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../context/ThemeContext';
import AnimatedContainer from '../components/AnimatedContainer';
import AppButton from '../components/AppButton';

interface Settings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  darkMode: boolean;
  autoSaveGames: boolean;
  targetScore: number;
}

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { colors, isDarkMode } = useTheme();
  
  const [settings, setSettings] = useState<Settings>({
    soundEnabled: true,
    vibrationEnabled: true,
    darkMode: false,
    autoSaveGames: true,
    targetScore: 50,
  });
  
  // Animation values
  const headerAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSettings();
    
    // Start header animation
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const handleBackPress = () => {
      navigation.navigate('Home');
      return true; 
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [navigation]);

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
    <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={24} color={colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.settingDescription, { color: colors.text + '99' }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary + '80' }}
        thumbColor={value ? colors.primary : '#f4f3f4'}
        ios_backgroundColor={colors.border}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      <Animated.View 
        style={[
          styles.header,
          { 
            backgroundColor: colors.card,
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0]
            })}]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={styles.headerRight} />
      </Animated.View>
      
      <ScrollView 
        style={[styles.scrollContent, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedContainer index={0}>
          <View style={[styles.section, styles.firstSection, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Game Settings</Text>
            
            <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <View style={styles.settingIcon}>
                <Ionicons name="flag" size={24} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Target Score</Text>
                <Text style={[styles.settingDescription, { color: colors.text + '99' }]}>
                  Set the winning score for the game
                </Text>
              </View>
              <View style={styles.scoreButtonsContainer}>
                {[25, 50, 75].map((score) => (
                  <TouchableOpacity
                    key={score}
                    style={[
                      styles.scoreButton,
                      { borderColor: colors.primary },
                      settings.targetScore === score && [
                        styles.activeScoreButton,
                        { backgroundColor: colors.primary }
                      ],
                    ]}
                    onPress={() => setTargetScore(score)}
                  >
                    <Text
                      style={[
                        styles.scoreButtonText,
                        { color: colors.primary },
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
        </AnimatedContainer>

        <AnimatedContainer index={1}>
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>App Settings</Text>
            
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
        </AnimatedContainer>

        <AnimatedContainer index={2}>
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>About</Text>
            
            <TouchableOpacity 
              style={[styles.aboutItem, { borderBottomColor: colors.border }]} 
              onPress={openPrivacyPolicy}
            >
              <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
              <Text style={[styles.aboutText, { color: colors.text }]}>Privacy Policy</Text>
            </TouchableOpacity>
            
            <View style={[styles.aboutItem, { borderBottomColor: 'transparent' }]}>
              <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
              <Text style={[styles.aboutText, { color: colors.text }]}>Version 1.0.0</Text>
            </View>
          </View>
        </AnimatedContainer>

        <AnimatedContainer index={3} delay={200}>
          <View style={styles.buttonContainer}>
            <AppButton
              title="Reset to Default Settings"
              variant="danger"
              icon="refresh-outline"
              onPress={resetSettings}
            />
          </View>
        </AnimatedContainer>
        
        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  firstSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
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
    marginTop: 3,
  },
  scoreButtonsContainer: {
    flexDirection: 'row',
  },
  scoreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  activeScoreButton: {
    backgroundColor: '#3498db',
  },
  scoreButtonText: {
    fontWeight: 'bold',
  },
  activeScoreButtonText: {
    color: 'white',
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  aboutText: {
    fontSize: 16,
    marginLeft: 15,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  spacer: {
    height: 40
  }
});

export default SettingsScreen;
