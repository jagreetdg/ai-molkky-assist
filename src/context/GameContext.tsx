import React, { createContext, useState, useContext, ReactNode } from 'react';
import { GameState } from '../types';
import { createNewGame, updatePlayerScore as updateScore } from '../services/gameService';

interface GameContextType {
  gameState: GameState | null;
  initGame: (playerNames: string[]) => GameState;
  updatePlayerScore: (score: number) => void;
  resetGame: () => void;
}

// Create a global variable to store the game state
let globalGameState: GameState | null = null;

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState | null>(globalGameState);

  const initGame = (playerNames: string[]): GameState => {
    console.log("GameContext: initGame called with playerNames:", playerNames);
    try {
      const newGameState = createNewGame(playerNames);
      console.log("GameContext: New game state created:", newGameState);
      
      // Update both the global variable and the state
      globalGameState = newGameState;
      setGameState(newGameState);
      
      console.log("GameContext: Game state set, globalGameState:", globalGameState);
      return newGameState;
    } catch (error) {
      console.error("Error initializing game:", error);
      throw error;
    }
  };

  const updatePlayerScore = (score: number) => {
    if (!globalGameState) return;
    
    const updatedState = updateScore(globalGameState, score);
    
    // Update both the global variable and the state
    globalGameState = updatedState;
    setGameState(updatedState);
  };

  const resetGame = () => {
    globalGameState = null;
    setGameState(null);
  };

  return (
    <GameContext.Provider
      value={{
        gameState: globalGameState,
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
