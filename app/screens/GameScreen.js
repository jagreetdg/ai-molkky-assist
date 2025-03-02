import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
} from "react-native";
import PlayerScore from "../components/PlayerScore";
import RoundHistory from "../components/RoundHistory";
import ScoreButton from "../components/ScoreButton";
import {
	initGame,
	updateScore,
	getCurrentPlayer,
	checkGameOver,
} from "../services/gameLogic";

export default function GameScreen({ navigation }) {
	const [gameState, setGameState] = useState(null);

	useEffect(() => {
		// Initialize a new game with 2 players
		const newGame = initGame(["Player 1", "Player 2"]);
		setGameState(newGame);
	}, []);

	const handleScoreUpdate = (score) => {
		if (!gameState || gameState.gameComplete) return;

		const updatedState = updateScore(gameState, score);
		setGameState(updatedState);

		// Check if game is over
		const gameOverInfo = checkGameOver(updatedState);
		if (gameOverInfo.isOver) {
			alert(`Game Over! ${gameOverInfo.winner} wins!`);
		}
	};

	const handleCameraPress = () => {
		navigation.navigate("Camera", { gameState });
	};

	if (!gameState)
		return (
			<View>
				<Text>Loading...</Text>
			</View>
		);

	const currentPlayerIndex = getCurrentPlayer(gameState);

	return (
		<View style={styles.container}>
			{gameState.players.map((player, index) => (
				<PlayerScore
					key={index}
					player={player}
					isActive={index === currentPlayerIndex}
				/>
			))}

			<RoundHistory rounds={gameState.rounds} />

			<View style={styles.actionRow}>
				<ScoreButton
					title="Score"
					onPress={() => {
						// Show a numeric input or modal to enter score
						const exampleScore = 6; // This would come from user input
						handleScoreUpdate(exampleScore);
					}}
				/>

				<ScoreButton
					title="Camera"
					color="#e89e5d"
					onPress={handleCameraPress}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#f5f5f5",
	},
	actionRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 20,
	},
});
