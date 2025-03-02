import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { GameState } from '../types';
import { createNewGame, updatePlayerScore as updateScore } from '../services/gameService';

interface GameContextType {
  gameState: GameState | null;
  initGame: (playerNames: string[]) => void;
  updatePlayerScore: (score: number) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);

  const initGame = (playerNames: string[]) => {
    const newGameState = createNewGame(playerNames);
    setGameState(newGameState);
  };

  const updatePlayerScore = (score: number) => {
    if (!gameState) return;
    const updatedState = updateScore(gameState, score);
    setGameState(updatedState);
  };

  const resetGame = () => {
    setGameState(null);
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        initGame,
        updatePlayerScore,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
