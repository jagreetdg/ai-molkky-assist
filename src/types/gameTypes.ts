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
