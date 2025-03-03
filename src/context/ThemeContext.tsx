import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getSettings, saveSettings } from '../utils/storage';

interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  notification: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  accent: string;
  disabled: string;
}

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const lightTheme: ThemeColors = {
  primary: '#3498db',
  background: '#f9f9f9',
  card: '#ffffff',
  text: '#2c3e50',
  border: '#ddd',
  notification: '#f39c12',
  success: '#2ecc71',
  error: '#e74c3c',
  warning: '#f39c12',
  info: '#3498db',
  accent: '#e67e22',
  disabled: '#95a5a6',
};

const darkTheme: ThemeColors = {
  primary: '#3498db',
  background: '#121212',
  card: '#1e1e1e',
  text: '#ecf0f1',
  border: '#333',
  notification: '#f39c12',
  success: '#2ecc71',
  error: '#e74c3c',
  warning: '#f39c12',
  info: '#3498db',
  accent: '#e67e22',
  disabled: '#7f8c8d',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme preference on startup
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const settings = await getSettings();
        if (settings && settings.darkMode !== undefined) {
          setIsDarkMode(settings.darkMode);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      
      // Save the new theme preference
      const settings = await getSettings();
      await saveSettings({ ...settings, darkMode: newMode });
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  };

  const colors = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
