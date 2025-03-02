import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
} from "react-native";
import { calculateOptimalMoves } from "../services/strategyEngine";
import { getCurrentPlayer } from "../services/gameLogic";

export default function StrategyScreen({ route, navigation }) {
	const [strategies, setStrategies] = useState([]);
	const { gameState, pinState } = route.params;

	useEffect(() => {
		if (gameState && pinState) {
			const currentPlayerIndex = getCurrentPlayer(gameState);
			const currentPlayer = gameState.players[currentPlayerIndex];

			// Calculate optimal moves
			const moves = calculateOptimalMoves(pinState, currentPlayer.score);
			setStrategies(moves);
		}
	}, [gameState, pinState]);

	const handleStrategySelect = (strategy) => {
		// In a full implementation, this would take the user back to the
		// scoreboard with the selected score
		navigation.navigate("Game");
	};

	const currentPlayerIndex = getCurrentPlayer(gameState);
	const currentPlayer = gameState.players[currentPlayerIndex];

	return (
		<View style={styles.container}>
			<View style={styles.gameState}>
				<Text style={styles.title}>{currentPlayer.name}'s Turn</Text>
				<Text style={styles.scoreText}>
					Current Score: {currentPlayer.score}
				</Text>
				<Text style={styles.scoreText}>Target: 50</Text>
			</View>

			<Text style={styles.sectionTitle}>Recommended Moves</Text>

			<ScrollView style={styles.strategiesList}>
				{strategies.map((strategy, index) => (
					<TouchableOpacity
						key={index}
						style={[
							styles.strategyItem,
							index === 0 ? styles.bestStrategy : null,
						]}
						onPress={() => handleStrategySelect(strategy)}
					>
						<View style={styles.pinCircle}>
							<Text style={styles.pinValue}>{strategy.value}</Text>
						</View>
						<View style={styles.strategyDetails}>
							<Text style={styles.strategyText}>
								Score {strategy.value} points
							</Text>
							<Text style={styles.probabilityText}>
								{Math.round(strategy.probability * 100)}% chance
							</Text>
						</View>
					</TouchableOpacity>
				))}

				{strategies.length === 0 && (
					<Text style={styles.noStrategies}>
						No optimal moves found. Try adjusting pin positions.
					</Text>
				)}
			</ScrollView>

			<TouchableOpacity
				style={styles.backButton}
				onPress={() => navigation.navigate("Game")}
			>
				<Text style={styles.buttonText}>Back to Scoreboard</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#f5f5f5",
	},
	gameState: {
		backgroundColor: "#e8f4ea",
		padding: 15,
		borderRadius: 10,
		marginBottom: 20,
		borderColor: "#4a7c59",
		borderWidth: 2,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 5,
	},
	scoreText: {
		fontSize: 16,
		textAlign: "center",
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
	},
	strategiesList: {
		flex: 1,
	},
	strategyItem: {
		flexDirection: "row",
		alignItems: "center",
		padding: 15,
		backgroundColor: "white",
		borderRadius: 10,
		marginBottom: 10,
		borderColor: "#e89e5d",
		borderWidth: 1,
	},
	bestStrategy: {
		backgroundColor: "#e89e5d",
	},
	pinCircle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "white",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 15,
	},
	pinValue: {
		fontSize: 16,
		fontWeight: "bold",
	},
	strategyDetails: {
		flex: 1,
	},
	strategyText: {
		fontSize: 16,
		color: "#333",
	},
	probabilityText: {
		fontSize: 14,
		color: "#666",
	},
	noStrategies: {
		textAlign: "center",
		padding: 20,
		color: "#666",
	},
	backButton: {
		backgroundColor: "#4a7c59",
		padding: 15,
		borderRadius: 10,
		alignItems: "center",
		marginTop: 20,
	},
	buttonText: {
		color: "white",
		fontSize: 16,
	},
});
