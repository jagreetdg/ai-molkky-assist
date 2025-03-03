import { GameState, Player } from '../types';

export const createNewGame = (playerNames: string[]): GameState => {
  const players = playerNames.map((name, index) => {
    const player: Player = {
      id: `player-${index}`,
      name,
      score: 0,
      consecutiveMisses: 0,
      isEliminated: false,
      isActive: index === 0  // First player starts as active
    };
    return player;
  });

  const gameState: GameState = {
    players,
    currentPlayerIndex: 0,
    round: 1,
    gameOver: false,
    winner: null,
  };
  return gameState;
};

export const updatePlayerScore = (gameState: GameState, score: number): GameState => {
  const { players, currentPlayerIndex, round } = gameState;
  const currentPlayer = players[currentPlayerIndex];

  // Create a new players array
  const updatedPlayers: Player[] = [];
  
  for (let i = 0; i < players.length; i++) {
    if (i === currentPlayerIndex) {
      // Update current player
      const newConsecutiveMisses = score === 0 ? currentPlayer.consecutiveMisses + 1 : 0;
      const newScore = score === 0 
        ? currentPlayer.score 
        : (currentPlayer.score + score <= 50 ? currentPlayer.score + score : 25);
      
      const player: Player = {
        id: currentPlayer.id,
        name: currentPlayer.name,
        score: newScore,
        consecutiveMisses: newConsecutiveMisses,
        isEliminated: score === 0 ? newConsecutiveMisses >= 3 : currentPlayer.isEliminated,
        isActive: false
      };
      updatedPlayers.push(player);
    } else {
      // Copy other players with isActive set to false
      const player: Player = {
        id: players[i].id,
        name: players[i].name,
        score: players[i].score,
        consecutiveMisses: players[i].consecutiveMisses,
        isEliminated: players[i].isEliminated,
        isActive: false
      };
      updatedPlayers.push(player);
    }
  }

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
    const nextPlayer = updatedPlayers[nextPlayerIndex];
    const activePlayer: Player = {
      id: nextPlayer.id,
      name: nextPlayer.name,
      score: nextPlayer.score,
      consecutiveMisses: nextPlayer.consecutiveMisses,
      isEliminated: nextPlayer.isEliminated,
      isActive: true
    };
    updatedPlayers[nextPlayerIndex] = activePlayer;
  }

  // Check if game is over
  const activePlayers = updatedPlayers.filter(p => !p.isEliminated);
  const winner = updatedPlayers.find(p => p.score === 50) || null;
  const gameOver = winner !== null || activePlayers.length <= 1;

  // Update round if we've gone through all players
  const newRound = nextPlayerIndex <= currentPlayerIndex ? round + 1 : round;

  const newGameState: GameState = {
    players: updatedPlayers,
    currentPlayerIndex: nextPlayerIndex,
    round: newRound,
    gameOver,
    winner: winner || (activePlayers.length === 1 ? activePlayers[0] : null),
  };
  
  return newGameState;
};

export const getActivePlayer = (gameState: GameState): Player | null => {
  if (!gameState || !gameState.players) return null;
  return gameState.players.find(player => player.isActive) || null;
};

export const getPlayerRanking = (players: Player[]): Player[] => {
  // Sort players by score (highest first)
  return [...players].sort((a, b) => b.score - a.score);
};
