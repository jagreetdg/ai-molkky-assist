// Pin detection types
export interface PinState {
  number: number;
  isStanding: boolean;
  position: { x: number; y: number };
}

export interface OptimalMove {
  targetPins: number[];
  availablePins: PinState[];
  expectedScore: number;
  winProbability: number;
  currentScore: number;
  recommendation: string;
  strategyExplanation: string;
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
  /**
   * Secondary color
   */
  secondary: string;
}
