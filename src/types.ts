export interface Player {
  id: string;
  name: string;
  score: number;
  isActive: boolean;
  consecutiveMisses?: number;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  gameOver: boolean;
  winner: Player | null;
  round: number;
  history: GameHistory[];
}

export interface GameHistory {
  playerId: string;
  round: number;
  score: number;
  totalScore: number;
}

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

// Updated to satisfy ParamListBase constraint with index signature
export interface RootStackParamList {
  Home: undefined;
  GameSetup: undefined;
  GamePlay: undefined;
  Camera: undefined;
  Analysis: { imageUri: string };
  History: undefined;
  Settings: undefined;
  [key: string]: object | undefined; 
}
