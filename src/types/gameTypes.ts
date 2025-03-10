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
   * Flag to track if game over modal has been shown
   */
  gameOverModalShown?: boolean;
}
