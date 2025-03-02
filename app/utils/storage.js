// src/utils/storage.js
import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage keys
const STORAGE_KEYS = {
	GAME_HISTORY: "molkky_game_history",
	PLAYER_PROFILES: "molkky_player_profiles",
	APP_SETTINGS: "molkky_app_settings",
	CURRENT_GAME: "molkky_current_game",
};

/**
 * Save game to history
 * @param {Object} game - Complete game data with players, scores, and results
 * @returns {Promise} Promise resolving to success or error
 */
export const saveGameToHistory = async (game) => {
	try {
		// Get existing history
		const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
		const history = historyJson ? JSON.parse(historyJson) : [];

		// Add timestamp if not present
		const gameWithTimestamp = {
			...game,
			endedAt: game.endedAt || new Date().toISOString(),
		};

		// Add to history
		history.push(gameWithTimestamp);

		// Save back to storage
		await AsyncStorage.setItem(
			STORAGE_KEYS.GAME_HISTORY,
			JSON.stringify(history)
		);
		return true;
	} catch (error) {
		console.error("Error saving game history:", error);
		return false;
	}
};

/**
 * Get game history
 * @returns {Promise} Promise resolving to array of game history objects
 */
export const getGameHistory = async () => {
	try {
		const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
		return historyJson ? JSON.parse(historyJson) : [];
	} catch (error) {
		console.error("Error retrieving game history:", error);
		return [];
	}
};

/**
 * Save player profile
 * @param {Object} player - Player profile data
 * @returns {Promise} Promise resolving to success or error
 */
export const savePlayerProfile = async (player) => {
	try {
		// Get existing profiles
		const profilesJson = await AsyncStorage.getItem(
			STORAGE_KEYS.PLAYER_PROFILES
		);
		const profiles = profilesJson ? JSON.parse(profilesJson) : [];

		// Check if player already exists
		const playerIndex = profiles.findIndex((p) => p.id === player.id);

		if (playerIndex >= 0) {
			// Update existing player
			profiles[playerIndex] = {
				...profiles[playerIndex],
				...player,
				updatedAt: new Date().toISOString(),
			};
		} else {
			// Add new player with ID
			profiles.push({
				...player,
				id: player.id || Date.now().toString(),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
		}

		// Save back to storage
		await AsyncStorage.setItem(
			STORAGE_KEYS.PLAYER_PROFILES,
			JSON.stringify(profiles)
		);
		return true;
	} catch (error) {
		console.error("Error saving player profile:", error);
		return false;
	}
};

/**
 * Get player profiles
 * @returns {Promise} Promise resolving to array of player profiles
 */
export const getPlayerProfiles = async () => {
	try {
		const profilesJson = await AsyncStorage.getItem(
			STORAGE_KEYS.PLAYER_PROFILES
		);
		return profilesJson ? JSON.parse(profilesJson) : [];
	} catch (error) {
		console.error("Error retrieving player profiles:", error);
		return [];
	}
};

/**
 * Save app settings
 * @param {Object} settings - App settings data
 * @returns {Promise} Promise resolving to success or error
 */
export const saveAppSettings = async (settings) => {
	try {
		// Get existing settings
		const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
		const existingSettings = settingsJson ? JSON.parse(settingsJson) : {};

		// Merge with new settings
		const updatedSettings = {
			...existingSettings,
			...settings,
			updatedAt: new Date().toISOString(),
		};

		// Save back to storage
		await AsyncStorage.setItem(
			STORAGE_KEYS.APP_SETTINGS,
			JSON.stringify(updatedSettings)
		);
		return true;
	} catch (error) {
		console.error("Error saving app settings:", error);
		return false;
	}
};

/**
 * Get app settings
 * @returns {Promise} Promise resolving to app settings object
 */
export const getAppSettings = async () => {
	try {
		const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
		return settingsJson
			? JSON.parse(settingsJson)
			: {
					// Default settings
					targetScore: 50,
					missesAllowed: 3,
					enableSuggestions: true,
					theme: "light",
			  };
	} catch (error) {
		console.error("Error retrieving app settings:", error);
		return {
			targetScore: 50,
			missesAllowed: 3,
			enableSuggestions: true,
			theme: "light",
		};
	}
};

/**
 * Save current game state for resuming later
 * @param {Object} gameState - Current game state
 * @returns {Promise} Promise resolving to success or error
 */
export const saveCurrentGame = async (gameState) => {
	try {
		await AsyncStorage.setItem(
			STORAGE_KEYS.CURRENT_GAME,
			JSON.stringify(gameState)
		);
		return true;
	} catch (error) {
		console.error("Error saving current game:", error);
		return false;
	}
};

/**
 * Get saved game to resume
 * @returns {Promise} Promise resolving to saved game state or null
 */
export const getSavedGame = async () => {
	try {
		const gameJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
		return gameJson ? JSON.parse(gameJson) : null;
	} catch (error) {
		console.error("Error retrieving saved game:", error);
		return null;
	}
};

/**
 * Clear saved game
 * @returns {Promise} Promise resolving to success or error
 */
export const clearSavedGame = async () => {
	try {
		await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);
		return true;
	} catch (error) {
		console.error("Error clearing saved game:", error);
		return false;
	}
};
