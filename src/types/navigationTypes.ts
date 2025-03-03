import { GameState } from './gameTypes';

// Navigation
export type RootStackParamList = {
  Home: undefined;
  GameSetup: undefined;
  GamePlay: { gameState: GameState };
  Camera: undefined;
  History: undefined;
  Settings: undefined;
  Analysis: { imageUri: string };
  [key: string]: object | undefined;
};
