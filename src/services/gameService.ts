import { GameState, Player, GameHistory } from '../types';

// Remove any unused functions
export const createNewGame = (playerNames: string[]): GameState => {
  const players: Player[] = playerNames.map((name, index) => ({
    id: `player-${index}`,
    name,
    score: 0,
    consecutiveMisses: 0,
    isEliminated: false,
    isActive: index === 0,  // First player starts as active
  }));

  return {
    players,
    currentPlayerIndex: 0,
    round: 1,
    gameOver: false,
    winner: null,
    history: [],
  };
};

export const updatePlayerScore = (gameState: GameState, score: number): GameState => {
  const { players, currentPlayerIndex, round } = gameState;
  const currentPlayer = players[currentPlayerIndex];

  // Create a new players array with updated player
  const updatedPlayers = players.map((player: Player) => ({
    ...player,
    isActive: false
  }));
  
  // Update the current player
  updatedPlayers[currentPlayerIndex] = {
    id: currentPlayer.id,
    name: currentPlayer.name,
    score: score === 0 
      ? currentPlayer.score 
      : (currentPlayer.score + score > 50 ? 25 : currentPlayer.score + score),
    consecutiveMisses: score === 0 ? (currentPlayer.consecutiveMisses + 1) : 0,
    isEliminated: score === 0 ? ((currentPlayer.consecutiveMisses + 1) >= 3) : currentPlayer.isEliminated,
    isActive: false
  };

  // Find next non-eliminated player
  let nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
  let loopCount = 0;
  
  while (loopCount < players.length) {
    if (!updatedPlayers[nextPlayerIndex].isEliminated) {
      break;
    }
    nextPlayerIndex = (nextPlayerIndex + 1) % players.length;
    loopCount++;
  }

  // Set the next player as active
  if (!gameState.gameOver) {
    updatedPlayers[nextPlayerIndex] = {
      ...updatedPlayers[nextPlayerIndex],
      isActive: true
    };
  }

  // Check if game is over
  const activePlayers = updatedPlayers.filter(p => !p.isEliminated);
  const winner = updatedPlayers.find(p => p.score === 50) || null;
  const gameOver = winner !== null || activePlayers.length <= 1;

  // Update round if we've gone through all players
  const newRound = nextPlayerIndex <= currentPlayerIndex ? round + 1 : round;

  // Create history entry
  const historyEntry: GameHistory = {
    playerId: currentPlayer.id,
    playerName: currentPlayer.name,
    round,
    score,
    timestamp: Date.now(),
  };

  return {
    players: updatedPlayers,
    currentPlayerIndex: nextPlayerIndex,
    round: newRound,
    gameOver,
    winner: winner || (activePlayers.length === 1 ? activePlayers[0] : null),
    history: [...gameState.history, historyEntry],
  };
};

export const getActivePlayer = (gameState: GameState): Player | null => {
  if (!gameState || !gameState.players) return null;
  return gameState.players.find(player => player.isActive) || null;
};

export const getPlayerRanking = (players: Player[]): Player[] => {
  return [...players].sort((a, b) => {
    if (a.isEliminated && !b.isEliminated) return 1;
    if (!a.isEliminated && b.isEliminated) return -1;
    return b.score - a.score;
  });
};
