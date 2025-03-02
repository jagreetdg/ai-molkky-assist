import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PlayerScore({ player, isActive }) {
	return (
		<View
			style={[
				styles.container,
				isActive ? styles.activeContainer : styles.inactiveContainer,
			]}
		>
			<View style={styles.playerInfo}>
				<Text style={styles.playerName}>{player.name}</Text>
				<Text style={styles.score}>{player.score}</Text>
			</View>

			{isActive && (
				<View style={styles.activeIndicator}>
					<Text style={styles.activeIndicatorText}>●</Text>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 15,
		borderRadius: 10,
		marginBottom: 10,
	},
	activeContainer: {
		backgroundColor: "#e8f4ea",
		borderColor: "#4a7c59",
		borderWidth: 2,
	},
	inactiveContainer: {
		backgroundColor: "#ffffff",
		borderColor: "#dddddd",
		borderWidth: 2,
	},
	playerInfo: {
		flex: 1,
	},
	playerName: {
		fontSize: 16,
		color: "#333333",
	},
	score: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#333333",
		marginTop: 5,
	},
	activeIndicator: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#4a7c59",
		alignItems: "center",
		justifyContent: "center",
	},
	activeIndicatorText: {
		color: "#ffffff",
		fontSize: 20,
	},
});
