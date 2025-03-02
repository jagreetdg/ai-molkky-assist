import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
	Alert,
} from "react-native";
import { loadGameHistory, saveGameSettings } from "../utils/storage";
import { initializeGame } from "../services/gameLogic";
import ScoreButton from "../components/ScoreButton";

const GameSetup = ({ navigation }) => {
	const [players, setPlayers] = useState([{ name: "", id: 1 }]);
	const [targetScore, setTargetScore] = useState("50");
	const [consecutiveMisses, setConsecutiveMisses] = useState("3");
	const [gameHistory, setGameHistory] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Load game history on component mount
		const loadHistory = async () => {
			try {
				const history = await loadGameHistory();
				setGameHistory(history || []);
				setIsLoading(false);
			} catch (error) {
				console.error("Failed to load game history:", error);
				setIsLoading(false);
			}
		};

		loadHistory();
	}, []);

	const addPlayer = () => {
		if (players.length < 8) {
			setPlayers([...players, { name: "", id: players.length + 1 }]);
		} else {
			Alert.alert("Player Limit", "Maximum 8 players allowed");
		}
	};

	const removePlayer = (id) => {
		if (players.length > 1) {
			setPlayers(players.filter((player) => player.id !== id));
		} else {
			Alert.alert("Cannot Remove", "At least one player is required");
		}
	};

	const updatePlayerName = (text, id) => {
		const updatedPlayers = players.map((player) =>
			player.id === id ? { ...player, name: text } : player
		);
		setPlayers(updatedPlayers);
	};

	const startGame = async () => {
		// Validate inputs
		if (players.some((player) => !player.name.trim())) {
			Alert.alert("Invalid Names", "All players must have names");
			return;
		}

		const numTargetScore = parseInt(targetScore);
		if (isNaN(numTargetScore) || numTargetScore < 1) {
			Alert.alert("Invalid Score", "Target score must be a positive number");
			return;
		}

		const numConsecutiveMisses = parseInt(consecutiveMisses);
		if (isNaN(numConsecutiveMisses) || numConsecutiveMisses < 1) {
			Alert.alert(
				"Invalid Setting",
				"Consecutive misses must be a positive number"
			);
			return;
		}

		// Initialize new game
		const gameSettings = {
			players: players.map((p) => ({
				name: p.name,
				score: 0,
				consecutiveMisses: 0,
			})),
			targetScore: numTargetScore,
			maxConsecutiveMisses: numConsecutiveMisses,
			currentPlayerIndex: 0,
			rounds: [],
			startTime: new Date().toISOString(),
		};

		// Save settings and initialize game
		try {
			await saveGameSettings(gameSettings);
			initializeGame(gameSettings);
			navigation.navigate("GameScreen");
		} catch (error) {
			console.error("Failed to start game:", error);
			Alert.alert("Error", "Failed to start game. Please try again.");
		}
	};

	const navigateToHistory = () => {
		navigation.navigate("HistoryScreen");
	};

	return (
		<ScrollView style={styles.container}>
			<Text style={styles.title}>Mölkky Scoreboard</Text>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Players</Text>
				{players.map((player) => (
					<View key={player.id} style={styles.playerRow}>
						<TextInput
							style={styles.input}
							placeholder={`Player ${player.id}`}
							value={player.name}
							onChangeText={(text) => updatePlayerName(text, player.id)}
						/>
						<TouchableOpacity
							style={styles.removeButton}
							onPress={() => removePlayer(player.id)}
						>
							<Text style={styles.removeButtonText}>✕</Text>
						</TouchableOpacity>
					</View>
				))}
				<TouchableOpacity style={styles.addButton} onPress={addPlayer}>
					<Text style={styles.addButtonText}>Add Player</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Game Settings</Text>
				<View style={styles.settingRow}>
					<Text style={styles.settingLabel}>Target Score:</Text>
					<TextInput
						style={styles.settingInput}
						keyboardType="numeric"
						value={targetScore}
						onChangeText={setTargetScore}
					/>
				</View>
				<View style={styles.settingRow}>
					<Text style={styles.settingLabel}>Max Consecutive Misses:</Text>
					<TextInput
						style={styles.settingInput}
						keyboardType="numeric"
						value={consecutiveMisses}
						onChangeText={setConsecutiveMisses}
					/>
				</View>
			</View>

			<View style={styles.buttonContainer}>
				<ScoreButton title="Start Game" onPress={startGame} color="#4CAF50" />
				<ScoreButton
					title="Game History"
					onPress={navigateToHistory}
					color="#2196F3"
				/>
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: "#f5f5f5",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
		marginVertical: 16,
		color: "#333",
	},
	section: {
		backgroundColor: "white",
		borderRadius: 8,
		padding: 16,
		marginBottom: 16,
		elevation: 2,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 12,
		color: "#444",
	},
	playerRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
	},
	input: {
		flex: 1,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 4,
		padding: 8,
		marginRight: 8,
		backgroundColor: "#fff",
	},
	removeButton: {
		backgroundColor: "#f44336",
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
	},
	removeButtonText: {
		color: "white",
		fontWeight: "bold",
		fontSize: 16,
	},
	addButton: {
		backgroundColor: "#2196F3",
		padding: 10,
		borderRadius: 4,
		alignItems: "center",
		marginTop: 8,
	},
	addButtonText: {
		color: "white",
		fontWeight: "bold",
	},
	settingRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 12,
	},
	settingLabel: {
		fontSize: 16,
		color: "#555",
	},
	settingInput: {
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 4,
		padding: 8,
		width: 80,
		textAlign: "center",
		backgroundColor: "#fff",
	},
	buttonContainer: {
		marginVertical: 16,
		gap: 10,
	},
});

export default GameSetup;
