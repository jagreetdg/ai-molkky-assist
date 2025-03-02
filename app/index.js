import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import CameraScreen from "./screens/CameraScreen";
import StrategyScreen from "./screens/StrategyScreen";
import GameScreen from "./screens/GameScreen";

const Stack = createStackNavigator();

export default function App() {
	return (
		// Only wrap the navigator with NavigationContainer once
		<NavigationContainer>
			<Stack.Navigator initialRouteName="Game">
				<Stack.Screen
					name="Game"
					component={GameScreen}
					options={{ title: "Mölkky Scoreboard" }}
				/>
				<Stack.Screen
					name="Camera"
					component={CameraScreen}
					options={{ title: "Pin Detection" }}
				/>
				<Stack.Screen
					name="Strategy"
					component={StrategyScreen}
					options={{ title: "Optimal Moves" }}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
}
