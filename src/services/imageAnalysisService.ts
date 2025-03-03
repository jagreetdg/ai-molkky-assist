import * as tf from '@tensorflow/tfjs';
import { PinState, OptimalMove, GameState } from '../types/index';

// Initialize TensorFlow.js
export const initTensorFlow = async (): Promise<void> => {
  await tf.ready();
  console.log('TensorFlow.js is ready');
};

// Mock function to detect pins from an image
// In a real implementation, this would use a trained model
export const detectPinsFromImage = async (imageUri: string): Promise<PinState[]> => {
  // This is a mock implementation
  // In a real app, we would use TensorFlow.js to analyze the image
  console.log('Analyzing image:', imageUri);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock pin detection - in a real app this would be the result of image analysis
  const mockPins: PinState[] = [];
  
  // Generate random pin states (1-12)
  for (let i = 1; i <= 12; i++) {
    const isStanding = Math.random() > 0.5;
    mockPins.push({
      number: i,
      isStanding,
      position: {
        x: Math.random() * 300 + 50, // Random x position between 50 and 350
        y: Math.random() * 300 + 50, // Random y position between 50 and 350
      }
    });
  }
  
  return mockPins;
};

// Calculate the optimal move based on the current game state and pin positions
export const calculateOptimalMove = (
  standingPins: PinState[],
  gameState?: GameState
): OptimalMove => {
  // Create a default game state if none is provided
  const defaultGameState: GameState = {
    players: [
      { id: '1', name: 'Player 1', score: 0, consecutiveMisses: 0, isEliminated: false, isActive: true },
      { id: '2', name: 'Player 2', score: 0, consecutiveMisses: 0, isEliminated: false, isActive: false }
    ],
    currentPlayerIndex: 0,
    round: 1,
    gameOver: false,
    winner: null
  };

  // Use the provided game state or the default one
  const currentGameState = gameState || defaultGameState;

  // If no pins are standing, return a default move
  if (standingPins.length === 0) {
    return {
      targetPins: [],
      availablePins: [],
      expectedScore: 0,
      winProbability: 0,
      currentScore: currentGameState.players[currentGameState.currentPlayerIndex].score,
      recommendation: "No pins detected",
      strategyExplanation: "No pins are standing. Please reset the pins."
    };
  }

  const currentPlayer = currentGameState.players[currentGameState.currentPlayerIndex];
  const currentScore = currentPlayer.score;
  const targetScore = 50; // In Mölkky, the target score is 50
  
  // If we have exactly 50 points, we've won
  if (currentScore === 50) {
    return {
      targetPins: [],
      availablePins: standingPins,
      expectedScore: 0,
      winProbability: 1,
      currentScore,
      recommendation: "You've won!",
      strategyExplanation: "You've reached exactly 50 points and won the game!"
    };
  }
  
  // If we have more than 50 points, we're busted back to 25
  if (currentScore > 50) {
    return {
      targetPins: [],
      availablePins: standingPins,
      expectedScore: 0,
      winProbability: 0,
      currentScore,
      recommendation: "You're over 50!",
      strategyExplanation: "Your score exceeds 50, so it will be reduced to 25."
    };
  }
  
  // If only one pin is standing, target it
  if (standingPins.length === 1) {
    const pin = standingPins[0];
    return {
      targetPins: [pin.number],
      availablePins: standingPins,
      expectedScore: pin.number,
      winProbability: pin.number + currentScore === 50 ? 0.9 : 0.1,
      currentScore,
      recommendation: `Target pin ${pin.number}`,
      strategyExplanation: `Only pin ${pin.number} is standing. Aim directly at it.`
    };
  }
  
  // Find the pin with the highest value (closest to what we need to win)
  let bestPin = standingPins[0];
  let bestDiff = Math.abs(targetScore - currentScore - bestPin.number);
  
  for (const pin of standingPins) {
    const diff = Math.abs(targetScore - currentScore - pin.number);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestPin = pin;
    }
  }
  
  // If we have a pin that gives us exactly what we need, target it
  if (bestDiff === 0) {
    return {
      targetPins: [bestPin.number],
      availablePins: standingPins,
      expectedScore: bestPin.number,
      winProbability: 0.8,
      currentScore,
      recommendation: `Target pin ${bestPin.number}`,
      strategyExplanation: `Pin ${bestPin.number} will give you exactly the points you need to win!`
    };
  }
  
  // If we need more than the value of any single pin, try to find a combination
  if (targetScore - currentScore > Math.max(...standingPins.map(p => p.number))) {
    // This is a simplified greedy approach
    let remainingTarget = targetScore - currentScore;
    const targetPins: number[] = [];
    const sortedPins = [...standingPins].sort((a, b) => b.number - a.number);
    
    for (const pin of sortedPins) {
      if (pin.number <= remainingTarget) {
        targetPins.push(pin.number);
        remainingTarget -= pin.number;
        
        // If we've reached our target, stop
        if (remainingTarget <= 0) {
          break;
        }
      }
    }
    
    // If we found a good combination
    if (targetPins.length > 0) {
      // Calculate the center of the target pins
      const targetPinObjects = standingPins.filter(pin => targetPins.includes(pin.number));
      
      return {
        targetPins,
        availablePins: standingPins,
        expectedScore: targetPins.reduce((sum, val) => sum + val, 0),
        winProbability: 0.5,
        currentScore,
        recommendation: `Target pins ${targetPins.join(', ')}`,
        strategyExplanation: `Try to hit multiple pins (${targetPins.join(', ')}) to get closer to 50.`
      };
    }
  }
  
  // Default: target the pin closest to what we need
  return {
    targetPins: [bestPin.number],
    availablePins: standingPins,
    expectedScore: bestPin.number,
    winProbability: 0.3,
    currentScore,
    recommendation: `Target pin ${bestPin.number}`,
    strategyExplanation: `Pin ${bestPin.number} is your best option to get closer to 50.`
  };
};
