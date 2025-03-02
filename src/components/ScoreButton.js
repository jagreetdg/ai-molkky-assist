import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function ScoreButton({ title, onPress, color = "#4a7c59" }) {
	return (
		<TouchableOpacity
			style={[styles.button, { backgroundColor: color }]}
			onPress={onPress}
		>
			<Text style={styles.buttonText}>{title}</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	button: {
		padding: 15,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		flex: 1,
		marginHorizontal: 5,
	},
	buttonText: {
		color: "#ffffff",
		fontSize: 16,
		fontWeight: "bold",
	},
});
