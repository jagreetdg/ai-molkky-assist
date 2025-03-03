import { GameState } from './gameTypes';

// Navigation
export type RootStackParamList = {
  Home: undefined;
  GameSetup: undefined;
  GamePlay: undefined;
  Camera: undefined;
  Settings: undefined;
  Analysis: { imageUri: string };
  [key: string]: object | undefined;
};
