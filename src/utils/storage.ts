import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, Player } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface GameHistoryItem {
  id: string;
  date: string;
  players: string[];
  winner: string | null;
  rounds: number;
  finalScores: { name: string; score: number }[];
}

// Save a completed game to history
export const saveGameToHistory = async (gameState: GameState): Promise<void> => {
  try {
    // Create a history item from the game state
    const historyItem: GameHistoryItem = {
      id: uuidv4(),
      date: new Date().toLocaleString(),
      players: gameState.players.map(player => player.name),
      winner: gameState.winner ? gameState.winner.name : null,
      rounds: gameState.round,
      finalScores: gameState.players.map(player => ({
        name: player.name,
        score: player.score
      }))
    };

    // Get existing history
    const existingHistoryJson = await AsyncStorage.getItem('gameHistory');
    const existingHistory: GameHistoryItem[] = existingHistoryJson 
      ? JSON.parse(existingHistoryJson) 
      : [];

    // Add new history item to the beginning of the array
    const updatedHistory = [historyItem, ...existingHistory];

    // Save updated history
    await AsyncStorage.setItem('gameHistory', JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error saving game to history:', error);
    throw error;
  }
};

// Get all game history
export const getGameHistory = async (): Promise<GameHistoryItem[]> => {
  try {
    const historyJson = await AsyncStorage.getItem('gameHistory');
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Error getting game history:', error);
    return [];
  }
};

// Clear all game history
export const clearGameHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('gameHistory');
  } catch (error) {
    console.error('Error clearing game history:', error);
    throw error;
  }
};

// Save app settings
export const saveSettings = async (settings: any): Promise<void> => {
  try {
    await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

// Get app settings
export const getSettings = async (): Promise<any> => {
  try {
    const settingsJson = await AsyncStorage.getItem('appSettings');
    return settingsJson ? JSON.parse(settingsJson) : null;
  } catch (error) {
    console.error('Error getting settings:', error);
    return null;
  }
};

// Get default settings
export const getDefaultSettings = (): any => {
  return {
    soundEnabled: true,
    vibrationEnabled: true,
    darkMode: false,
    autoSaveGames: true,
    targetScore: 50,
  };
};

// Save the current game state (for resuming later)
export const saveCurrentGame = async (gameState: GameState): Promise<void> => {
  try {
    await AsyncStorage.setItem('currentGame', JSON.stringify(gameState));
  } catch (error) {
    console.error('Error saving current game:', error);
    throw error;
  }
};

// Get the saved game state
export const getCurrentGame = async (): Promise<GameState | null> => {
  try {
    const gameStateJson = await AsyncStorage.getItem('currentGame');
    return gameStateJson ? JSON.parse(gameStateJson) : null;
  } catch (error) {
    console.error('Error getting current game:', error);
    return null;
  }
};

// Clear the saved game state
export const clearCurrentGame = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('currentGame');
  } catch (error) {
    console.error('Error clearing current game:', error);
    throw error;
  }
};
