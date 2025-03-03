import React, { useState, useEffect, useRef } from "react";
import {
	StyleSheet,
	View,
	Text,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
	Dimensions,
	SafeAreaView,
	StatusBar,
	Platform,
	BackHandler,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../types/index";
import { initTensorFlow } from "../services/imageAnalysisService";
import { useTheme } from "../context/ThemeContext";

type CameraScreenNavigationProp = StackNavigationProp<
	RootStackParamList,
	"Camera"
>;
type CameraScreenRouteProp = RouteProp<RootStackParamList, "Camera">;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CAMERA_SIZE = SCREEN_WIDTH;

const CameraScreen = () => {
	const navigation = useNavigation<CameraScreenNavigationProp>();
	const route = useRoute<CameraScreenRouteProp>();
	const [permission, requestPermission] = useCameraPermissions();
	const { colors, isDarkMode } = useTheme();

	const [flash, setFlash] = useState(false);
	const [type, setType] = useState<"back" | "front">("back");
	const [isLoading, setIsLoading] = useState(true);
	const [isCapturing, setIsCapturing] = useState(false);
	const [showCaptureOverlay, setShowCaptureOverlay] = useState(false);

	const cameraRef = useRef<CameraView>(null);

	useEffect(() => {
		(async () => {
			try {
				await initTensorFlow();
			} catch (error) {
				console.error("Failed to initialize TensorFlow.js:", error);
				Alert.alert(
					"Error",
					"Failed to initialize machine learning engine. Some features may not work correctly."
				);
			} finally {
				setIsLoading(false);
			}
		})();
	}, []);

	useEffect(() => {
		const handleBackPress = () => {
			// Navigate back to GamePlay screen instead of using the default back behavior
			navigation.navigate('GamePlay');
			return true; // Prevent default behavior
		};

		// Add event listener for hardware back button
		BackHandler.addEventListener('hardwareBackPress', handleBackPress);

		// Clean up the event listener on component unmount
		return () => {
			BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
		};
	}, [navigation]);

	useEffect(() => {
		(async () => {
			try {
				const { status: mediaStatus } =
					await MediaLibrary.requestPermissionsAsync();
				if (!permission?.granted) {
					await requestPermission();
				}
			} catch (error) {
				console.error                ("Failed to request media permissions:", error);
			}
		})();
	}, [permission, requestPermission]);

	const takePicture = async () => {
		if (!cameraRef.current || isCapturing) return;

		try {
			setIsCapturing(true);
			setShowCaptureOverlay(true);
			
			const photo = await cameraRef.current.takePictureAsync({
				quality: 0.8,
				base64: false,
				skipProcessing: false,
			});

			if (photo) {
				await MediaLibrary.saveToLibraryAsync(photo.uri);
				navigation.navigate("Analysis", {
					imageUri: photo.uri,
				});
			}
		} catch (error) {
			console.error("Error taking picture:", error);
			Alert.alert("Error", "Failed to take picture. Please try again.");
			setShowCaptureOverlay(false);
			setIsCapturing(false);
		}
	};

	const toggleCameraType = () => {
		if (isCapturing) return;
		setType((current) => (current === "back" ? "front" : "back"));
	};

	const toggleFlash = () => {
		if (isCapturing) return;
		setFlash((current) => !current);
	};

	if (isLoading) {
		return (
			<View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
				<ActivityIndicator size="large" color={colors.primary} />
				<Text style={[styles.loadingText, { color: colors.text }]}>Initializing camera...</Text>
			</View>
		);
	}

	if (!permission) {
		return (
			<View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
				<ActivityIndicator size="large" color={colors.primary} />
				<Text style={[styles.permissionText, { color: colors.text }]}>
					Requesting camera permissions...
				</Text>
			</View>
		);
	}

	if (!permission.granted) {
		return (
			<View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
				<Ionicons name="camera-outline" size={64} color={colors.error} />
				<Text style={[styles.permissionText, { color: colors.text }]}>No access to camera</Text>
				<Text style={[styles.permissionSubtext, { color: colors.text }]}>
					Please enable camera access in your device settings to use this
					feature.
				</Text>
				<TouchableOpacity
					style={[styles.permissionButton, { backgroundColor: colors.primary }]}
					onPress={() => navigation.goBack()}
				>
					<Text style={styles.permissionButtonText}>Go Back</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="light-content" backgroundColor="black" />
			
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}
					disabled={isCapturing}
				>
					<Ionicons name="chevron-back" size={28} color="white" />
				</TouchableOpacity>
				<View style={styles.headerTextContainer}>
					<Text style={styles.guideText}>
						Position all Mölkky pins in frame
					</Text>
				</View>
				<View style={styles.spacer} />
			</View>

			{/* Camera */}
			<View style={styles.cameraContainer}>
				<View style={styles.cameraFrame}>
					<CameraView
						ref={cameraRef}
						style={[styles.camera, { width: CAMERA_SIZE, height: CAMERA_SIZE }]}
						facing={type}
						enableTorch={flash}
						ratio="1:1"
					/>
					
					{/* Grid overlay for composition */}
					<View style={styles.gridOverlay}>
						<View style={styles.gridRow}>
							<View style={styles.gridLine} />
							<View style={styles.gridLine} />
						</View>
						<View style={styles.gridColumn}>
							<View style={styles.gridLine} />
							<View style={styles.gridLine} />
						</View>
					</View>
					
					{/* Capture overlay */}
					{showCaptureOverlay && (
						<View style={styles.captureOverlay}>
							<ActivityIndicator size="large" color="white" />
						</View>
					)}
				</View>
			</View>

			{/* Controls */}
			<View style={styles.controlsContainer}>
				<TouchableOpacity
					style={[
						styles.controlButton, 
						isCapturing && styles.disabledButton
					]}
					onPress={toggleFlash}
					disabled={isCapturing}
				>
					<Ionicons
						name={flash ? "flash" : "flash-off"}
						size={24}
						color="white"
					/>
				</TouchableOpacity>

				<TouchableOpacity
					style={[
						styles.captureButton,
						isCapturing && styles.disabledCaptureButton
					]}
					onPress={takePicture}
					disabled={isCapturing}
				>
					{isCapturing ? (
						<ActivityIndicator size="large" color={colors.primary} />
					) : (
						<View style={styles.captureButtonInner} />
					)}
				</TouchableOpacity>

				<TouchableOpacity
					style={[
						styles.controlButton,
						isCapturing && styles.disabledButton
					]}
					onPress={toggleCameraType}
					disabled={isCapturing}
				>
					<Ionicons name="camera-reverse-outline" size={24} color="white" />
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
};

export default CameraScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "black",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 16,
		backgroundColor: "rgba(0,0,0,0.6)",
	},
	backButton: {
		padding: 8,
		borderRadius: 20,
	},
	headerTextContainer: {
		flex: 1,
		alignItems: "center",
	},
	guideText: {
		color: "white",
		fontSize: 16,
		textAlign: "center",
		fontWeight: "500",
	},
	spacer: {
		width: 44,
	},
	cameraContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#000",
	},
	cameraFrame: {
		width: CAMERA_SIZE,
		height: CAMERA_SIZE,
		borderRadius: 12,
		overflow: "hidden",
		position: "relative",
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.3,
				shadowRadius: 4,
			},
			android: {
				elevation: 5,
			},
		}),
	},
	camera: {
		aspectRatio: 1,
	},
	gridOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "transparent",
	},
	gridRow: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	gridColumn: {
		...StyleSheet.absoluteFillObject,
		flexDirection: "column",
		justifyContent: "space-between",
	},
	gridLine: {
		flex: 1,
		borderWidth: 0.5,
		borderColor: "rgba(255,255,255,0.3)",
	},
	captureOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	controlsContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		paddingVertical: 30,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		backgroundColor: "rgba(20,20,20,0.9)",
	},
	controlButton: {
		padding: 15,
		borderRadius: 40,
		backgroundColor: "rgba(255,255,255,0.2)",
	},
	disabledButton: {
		opacity: 0.5,
	},
	captureButton: {
		width: 70,
		height: 70,
		borderRadius: 35,
		backgroundColor: "rgba(255,255,255,0.3)",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 3,
		borderColor: "white",
	},
	disabledCaptureButton: {
		opacity: 0.7,
		backgroundColor: "rgba(100,100,100,0.3)",
	},
	captureButtonInner: {
		width: 54,
		height: 54,
		borderRadius: 27,
		backgroundColor: "white",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 10,
		fontSize: 16,
	},
	permissionContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	permissionText: {
		fontSize: 18,
		marginTop: 20,
		textAlign: "center",
		fontWeight: "600",
	},
	permissionSubtext: {
		fontSize: 14,
		marginTop: 10,
		textAlign: "center",
		opacity: 0.7,
	},
	permissionButton: {
		marginTop: 20,
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
	},
	permissionButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
});
