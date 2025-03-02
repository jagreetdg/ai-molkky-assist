import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import GameSetupScreen from '../screens/GameSetupScreen';
import GamePlayScreen from '../screens/GamePlayScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CameraScreen from '../screens/CameraScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { colors, isDarkMode } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          cardStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'Mölkky Assist AI',
          }}
        />
        <Stack.Screen 
          name="GameSetup" 
          component={GameSetupScreen}
          options={{
            title: 'New Game',
          }}
        />
        <Stack.Screen 
          name="GamePlay" 
          component={GamePlayScreen}
          options={{
            title: 'Game in Progress',
          }}
        />
        <Stack.Screen 
          name="Camera" 
          component={CameraScreen}
          options={{
            title: 'Pin Detection',
          }}
        />
        <Stack.Screen 
          name="Analysis" 
          component={AnalysisScreen}
          options={{
            title: 'Move Analysis',
          }}
        />
        <Stack.Screen 
          name="History" 
          component={HistoryScreen}
          options={{
            title: 'Game History',
          }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            title: 'Settings',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
