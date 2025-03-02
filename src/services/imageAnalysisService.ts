import * as tf from '@tensorflow/tfjs';
import { PinState, OptimalMove, GameState } from '../types';

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
  gameState: GameState,
  pinStates: PinState[]
): OptimalMove => {
  const standingPins = pinStates.filter(pin => pin.isStanding);
  
  // Get the current player and their score
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const currentScore = currentPlayer.score;
  
  // Calculate the target score needed to win
  const targetScore = 50 - currentScore;
  
  // If the target score is exactly a pin number and that pin is standing, that's the optimal move
  const exactPin = standingPins.find(pin => pin.number === targetScore);
  if (exactPin) {
    return {
      targetPins: [exactPin.number],
      availablePins: pinStates,
      expectedScore: exactPin.number,
      winProbability: 0.8, // High probability since it's a direct hit
      currentScore,
      recommendation: `Aim for pin #${exactPin.number} to win the game!`,
      strategyExplanation: `You need exactly ${targetScore} points to reach 50 and win. Hit pin #${exactPin.number} directly for the win.`
    };
  }
  
  // If the target score is less than 12 (max pin value), look for combinations
  if (targetScore < 12) {
    // Find pins that could add up to the target score
    const possiblePins = standingPins.filter(pin => pin.number <= targetScore);
    
    if (possiblePins.length > 0) {
      // Sort by pin number (higher pins are usually harder to hit)
      const sortedPins = [...possiblePins].sort((a, b) => a.number - b.number);
      const bestPin = sortedPins[0];
      
      return {
        targetPins: [bestPin.number],
        availablePins: pinStates,
        expectedScore: bestPin.number,
        winProbability: 0.6,
        currentScore,
        recommendation: `Aim for pin #${bestPin.number} to get closer to winning.`,
        strategyExplanation: `You need ${targetScore} points to win. Hitting pin #${bestPin.number} will get you closer without going over 50.`
      };
    }
  }
  
  // If we need more than 12 points, or no good combination exists,
  // suggest knocking down multiple pins (between 2-6 pins)
  const standingPinNumbers = standingPins.map(pin => pin.number);
  
  // Group pins by proximity (this is a simplified approach)
  // In a real implementation, we would use clustering based on pin positions
  const pinGroups: number[][] = [];
  
  // Simple grouping based on pin numbers (1-4, 5-8, 9-12)
  const group1 = standingPinNumbers.filter(num => num >= 1 && num <= 4);
  const group2 = standingPinNumbers.filter(num => num >= 5 && num <= 8);
  const group3 = standingPinNumbers.filter(num => num >= 9 && num <= 12);
  
  [group1, group2, group3].forEach(group => {
    if (group.length > 0) {
      pinGroups.push(group);
    }
  });
  
  // Choose the group that would give the best score
  let bestGroup: number[] = [];
  let bestScore = 0;
  let bestProbability = 0;
  
  pinGroups.forEach(group => {
    // For multiple pins, the score is the count of pins
    const expectedScore = group.length;
    
    // Calculate how close this would get us to the target
    const newScore = currentScore + expectedScore;
    const distanceToTarget = Math.abs(50 - newScore);
    
    // Calculate a probability based on how close we get to the target
    // and how many pins we need to hit
    const probability = Math.max(0.1, 1 - (distanceToTarget / 50) - (group.length * 0.05));
    
    if (
      (newScore <= 50 && newScore > currentScore + bestScore) || 
      (bestScore === 0 && newScore <= 50)
    ) {
      bestGroup = group;
      bestScore = expectedScore;
      bestProbability = probability;
    }
  });
  
  // If we couldn't find a good group, just suggest the highest value pin
  if (bestGroup.length === 0 && standingPins.length > 0) {
    const highestPin = standingPins.reduce(
      (highest, pin) => pin.number > highest.number ? pin : highest,
      standingPins[0]
    );
    
    return {
      targetPins: [highestPin.number],
      availablePins: pinStates,
      expectedScore: highestPin.number,
      winProbability: 0.3,
      currentScore,
      recommendation: `Aim for pin #${highestPin.number} for maximum points.`,
      strategyExplanation: `You need ${targetScore} points to win. Since there's no ideal combination, aim for the highest value pin (#${highestPin.number}) to maximize your score.`
    };
  }
  
  const pointsNeededText = targetScore > bestScore 
    ? `You'll still need ${targetScore - bestScore} more points after this throw.`
    : `This will give you exactly the points you need to win!`;
    
  return {
    targetPins: bestGroup,
    availablePins: pinStates,
    expectedScore: bestScore,
    winProbability: bestProbability,
    currentScore,
    recommendation: bestGroup.length > 1 
      ? `Try to knock down ${bestGroup.length} pins at once.` 
      : `Aim for pin #${bestGroup[0]}.`,
    strategyExplanation: `You need ${targetScore} points to win. Knocking down ${bestGroup.length} pins will give you ${bestScore} points. ${pointsNeededText}`
  };
};
