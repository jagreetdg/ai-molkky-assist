import React, { createContext, useState, useContext, ReactNode } from 'react';
import { GameState } from '../types';
import { createNewGame, updatePlayerScore as updateScore } from '../services/gameService';

interface GameContextType {
  gameState: GameState | null;
  initGame: (playerNames: string[]) => GameState;
  updatePlayerScore: (score: number) => GameState;
  resetGame: () => void;
  undoLastMove: () => void;
}

// Create a global variable to store the game state
let globalGameState: GameState | null = null;
// Store previous game states for undo functionality
let gameStateHistory: GameState[] = [];

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState | null>(globalGameState);

  const initGame = (playerNames: string[]): GameState => {
    console.log("GameContext: initGame called with playerNames:", playerNames);
    try {
      const newGameState = createNewGame(playerNames);
      console.log("GameContext: New game state created:", newGameState);
      
      // Update both the global variable and the state
      gameStateHistory = [];
      globalGameState = {...newGameState}; // Make sure to create a new object
      
      // Only update the state if it's different
      if (JSON.stringify(gameState) !== JSON.stringify(newGameState)) {
        setGameState({...newGameState}); // Use spread to ensure a new object reference
      }
      
      console.log("GameContext: Game state set, globalGameState:", globalGameState);
      return {...newGameState}; // Return a copy to prevent reference issues
    } catch (error) {
      console.error("Error initializing game:", error);
      throw error;
    }
  };

  const updatePlayerScore = (score: number): GameState => {
    console.log("GameContext: updatePlayerScore called with score:", score);
    
    if (!gameState) {
      console.error("Cannot update score: no active game");
      throw new Error("Cannot update score: no active game");
    }
    
    try {
      // Save the current state to history before updating
      const currentState = {...gameState};
      gameStateHistory.push(currentState);
      
      // Make sure globalGameState is also not null
      if (!globalGameState) {
        console.log("GameContext: globalGameState was null, using local gameState");
        globalGameState = {...gameState};
      }
      
      // Update the global game state
      const updatedGameState = updateScore(globalGameState, score);
      globalGameState = {...updatedGameState}; // Use object spread to ensure a new object reference
      
      // Only update the state if it's different
      if (JSON.stringify(gameState) !== JSON.stringify(updatedGameState)) {
        setGameState({...updatedGameState});
      }
      
      console.log("GameContext: Updated game state:", updatedGameState);
      return {...updatedGameState}; // Return a copy to prevent reference issues
    } catch (error) {
      console.error("Error updating score:", error);
      throw error;
    }
  };

  const undoLastMove = () => {
    if (!gameStateHistory.length) return;
    
    // Get the last state from history
    const previousState = gameStateHistory.pop();
    
    if (previousState) {
      // Restore the previous state
      globalGameState = previousState;
      setGameState(previousState);
    }
  };

  const resetGame = () => {
    console.log("GameContext: resetGame called");
    gameStateHistory = [];
    globalGameState = null;
    setGameState(null);
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        initGame,
        updatePlayerScore,
        resetGame,
        undoLastMove,
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
