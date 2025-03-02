import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function RoundHistory({ rounds }) {
	if (!rounds || rounds.length === 0) {
		return (
			<View style={styles.container}>
				<Text style={styles.title}>Round History</Text>
				<Text style={styles.emptyText}>No rounds played yet</Text>
			</View>
		);
	}

	// Create a simplified representation of scores by player
	const playerScores = {};

	rounds.forEach((round) => {
		round.scores.forEach((score) => {
			if (!playerScores[score.playerName]) {
				playerScores[score.playerName] = [];
			}
			playerScores[score.playerName].push(score.points);
		});
	});

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Round History</Text>

			<ScrollView>
				{Object.entries(playerScores).map(([playerName, scores], index) => (
					<Text key={index} style={styles.historyRow}>
						{playerName}: [{scores.join(", ")}]
					</Text>
				))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#ffffff",
		borderRadius: 10,
		padding: 15,
		marginVertical: 10,
		borderColor: "#dddddd",
		borderWidth: 2,
		maxHeight: 120,
	},
	title: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 10,
		textAlign: "center",
	},
	historyRow: {
		fontSize: 14,
		color: "#666666",
		marginBottom: 5,
	},
	emptyText: {
		fontSize: 14,
		color: "#999999",
		fontStyle: "italic",
		textAlign: "center",
	},
});
