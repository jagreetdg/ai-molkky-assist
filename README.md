# Mölkky Assist AI

A smart Mölkky scoreboard app with AI-powered pin analysis and strategy recommendations.

## Features

- **Scoreboard**: Keep track of player scores in your Mölkky games
- **Pin Analysis**: Take pictures of the current pin positions and get AI analysis
- **Strategy Recommendations**: Get suggestions for optimal pins to target based on the current game state
- **Game History**: View past games and statistics
- **Customizable Settings**: Adjust game rules and app preferences

## Technologies Used

- React Native
- Expo
- TensorFlow.js for image analysis
- React Navigation for navigation
- AsyncStorage for local data storage

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-molkky-assist.git
cd ai-molkky-assist
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

4. Run on a device or emulator:
   - Scan the QR code with the Expo Go app on your phone
   - Press 'a' to run on an Android emulator
   - Press 'i' to run on an iOS simulator

## How to Play

1. Start a new game from the home screen
2. Add player names (2-10 players)
3. During gameplay, you can:
   - Enter scores manually using the score pad
   - Take a picture of the pins to get AI analysis and strategy recommendations
4. The game follows standard Mölkky rules:
   - Knocking down one pin scores the number on the pin
   - Knocking down multiple pins scores the number of pins knocked down
   - A player wins by reaching exactly 50 points
   - If a player exceeds 50 points, their score is reduced to 25
   - If a player misses three times in a row, they are eliminated

## Development

### Project Structure

```
ai-molkky-assist/
├── assets/               # Images and icons
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/          # React Context providers
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # App screens
│   ├── services/         # Business logic services
│   ├── utils/            # Utility functions
│   └── types.ts          # TypeScript type definitions
├── App.tsx               # Main app component
└── package.json          # Dependencies and scripts
```

### Future Enhancements

- Implement a trained model for more accurate pin detection
- Add multiplayer functionality via Bluetooth or local network
- Support for different Mölkky rule variations
- Statistics and player rankings
- Cloud synchronization for game history

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by traditional Mölkky scoreboard apps
- Pin detection powered by TensorFlow.js
