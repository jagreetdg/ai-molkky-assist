import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import GameScreen from "./src/screens/GameScreen";
import CameraScreen from "./src/screens/CameraScreen";
import StrategyScreen from "./src/screens/StrategyScreen";

const Stack = createStackNavigator();

export default function App() {
	return (
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
