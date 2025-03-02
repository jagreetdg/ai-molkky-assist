import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Camera } from "expo-camera";
import * as tf from "@tensorflow/tfjs";
import { bundleResourceIO } from "@tensorflow/tfjs-react-native";
import { detectPins } from "../services/pinDetection";

export default function CameraScreen({ route, navigation }) {
	const [hasPermission, setHasPermission] = useState(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [detectedPins, setDetectedPins] = useState(null);
	const cameraRef = useRef(null);
	const { gameState } = route.params;

	useEffect(() => {
		(async () => {
			const { status } = await Camera.requestCameraPermissionsAsync();
			setHasPermission(status === "granted");

			// Initialize TensorFlow JS
			await tf.ready();
			console.log("TensorFlow.js is ready");
		})();
	}, []);

	const takePicture = async () => {
		if (cameraRef.current && !isProcessing) {
			setIsProcessing(true);
			try {
				const photo = await cameraRef.current.takePictureAsync({
					quality: 0.7,
					base64: true,
				});

				// Process the image to detect pins
				// In a real app, this would use the actual ML model
				console.log("Processing image...");

				// This is a mock response - in a real app, this would be the result
				// of the image analysis
				const pins = await detectPins(photo);
				setDetectedPins(pins);
			} catch (error) {
				console.error("Error taking picture:", error);
				alert("Error detecting pins. Please try again.");
			} finally {
				setIsProcessing(false);
			}
		}
	};

	const analyzeStrategy = () => {
		// In a real app, we would pass the detected pins
		// Here we'll navigate with mock data for now
		navigation.navigate("Strategy", {
			gameState,
			pinState: detectedPins || {
				standingPins: [
					{ id: 4, value: 4, position: { x: 0.3, y: 0.2 } },
					{ id: 6, value: 6, position: { x: 0.7, y: 0.2 } },
					{ id: 12, value: 12, position: { x: 0.7, y: 0.4 } },
					{ id: 8, value: 8, position: { x: 0.4, y: 0.3 } },
					{ id: 2, value: 2, position: { x: 0.4, y: 0.1 } },
				],
			},
		});
	};

	if (hasPermission === null) {
		return (
			<View>
				<Text>Requesting camera permission...</Text>
			</View>
		);
	}
	if (hasPermission === false) {
		return <Text>No access to camera</Text>;
	}

	return (
		<View style={styles.container}>
			<Camera
				style={styles.camera}
				type={Camera.Constants.Type.back}
				ref={cameraRef}
			>
				<View style={styles.buttonContainer}>
					<TouchableOpacity
						style={styles.button}
						onPress={takePicture}
						disabled={isProcessing}
					>
						<Text style={styles.text}>
							{isProcessing ? "Processing..." : "Capture"}
						</Text>
					</TouchableOpacity>
				</View>
			</Camera>

			{detectedPins && (
				<View style={styles.resultsContainer}>
					<Text style={styles.resultsTitle}>Detected Pins</Text>
					<Text>
						Found {detectedPins.standingPins?.length || 0} standing pins
					</Text>

					<TouchableOpacity
						style={[styles.button, styles.analyzeButton]}
						onPress={analyzeStrategy}
					>
						<Text style={styles.text}>Analyze Best Move</Text>
					</TouchableOpacity>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	camera: {
		flex: 1,
	},
	buttonContainer: {
		position: "absolute",
		bottom: 20,
		width: "100%",
		alignItems: "center",
	},
	button: {
		backgroundColor: "#4a7c59",
		padding: 15,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	text: {
		color: "white",
		fontSize: 16,
	},
	resultsContainer: {
		position: "absolute",
		bottom: 0,
		width: "100%",
		backgroundColor: "rgba(255, 255, 255, 0.8)",
		padding: 20,
		borderTopLeftRadius: 15,
		borderTopRightRadius: 15,
	},
	resultsTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
	},
	analyzeButton: {
		marginTop: 15,
		backgroundColor: "#e89e5d",
	},
});
