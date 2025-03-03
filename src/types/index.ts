// Navigation
export type RootStackParamList = {
  Home: undefined;
  GameSetup: undefined;
  GamePlay: undefined;
  Camera: undefined;
  History: undefined;
  Settings: undefined;
  Analysis: { imageUri: string };
};

// Game Types
export interface Player {
  /**
   * Player's unique identifier
   */
  id: string;
  /**
   * Player's display name
   */
  name: string;
  /**
   * Current score (0-50)
   */
  score: number;
  /**
   * Number of consecutive misses (0-3)
   */
  consecutiveMisses: number;
  /**
   * Whether player is eliminated (3 misses)
   */
  isEliminated: boolean;
  /**
   * Whether it's this player's turn
   */
  isActive: boolean;
}

export interface GameHistory {
  /**
   * ID of the player who made the move
   */
  playerId: string;
  /**
   * Name of the player who made the move
   */
  playerName: string;
  /**
   * Round number when move was made
   */
  round: number;
  /**
   * Score achieved in this move
   */
  score: number;
  /**
   * Total score after this move
   */
  totalScore: number;
  /**
   * When the move was made
   */
  timestamp: number;
}

export interface GameState {
  /**
   * List of all players
   */
  players: Player[];
  /**
   * Index of current player
   */
  currentPlayerIndex: number;
  /**
   * Current round number
   */
  round: number;
  /**
   * Whether game is finished
   */
  gameOver: boolean;
  /**
   * Winning player if game is over
   */
  winner: Player | null;
  /**
   * List of all moves made
   */
  history: GameHistory[];
}

// Pin detection types
export interface PinState {
  id: number;
  isStanding: boolean;
  position: { x: number; y: number };
  confidence: number;
}

export interface OptimalMove {
  targetPins: number[];
  expectedScore: number;
  difficulty: 'easy' | 'medium' | 'hard';
  aimPosition: { x: number; y: number };
}

// Settings
export interface AppSettings {
  /**
   * Whether dark mode is enabled
   */
  darkMode: boolean;
  /**
   * Whether games are automatically saved
   */
  autoSaveGames: boolean;
  /**
   * Whether sound effects are enabled
   */
  soundEnabled: boolean;
  /**
   * Whether vibration is enabled
   */
  vibrationEnabled: boolean;
}

// Theme
export interface ThemeColors {
  /**
   * Primary color
   */
  primary: string;
  /**
   * Background color
   */
  background: string;
  /**
   * Card color
   */
  card: string;
  /**
   * Text color
   */
  text: string;
  /**
   * Border color
   */
  border: string;
  /**
   * Error color
   */
  error: string;
  /**
   * Success color
   */
  success: string;
}
