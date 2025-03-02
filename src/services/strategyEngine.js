// src/services/strategyEngine.js
import { getPossiblePoints } from "./gameLogic";

/**
 * Calculates optimal pin targets based on current game state
 * @param {Array} players - Array of player objects with scores
 * @param {number} currentPlayerIndex - Index of the current player
 * @param {Array} standingPins - Array of standing pin numbers
 * @param {Object} gameConfig - Game configuration settings
 * @returns {Array} Array of strategy suggestions
 */
export const calculateOptimalTargets = (
	players,
	currentPlayerIndex,
	standingPins,
	gameConfig
) => {
	const currentPlayer = players[currentPlayerIndex];
	const targetScore = gameConfig.targetScore || 50;
	const suggestions = [];

	// Points needed to win directly
	const pointsToWin = targetScore - currentPlayer.score;

	// If player can win with a direct hit
	if (
		pointsToWin > 0 &&
		pointsToWin <= 12 &&
		standingPins.includes(pointsToWin)
	) {
		suggestions.push({
			pins: [pointsToWin],
			reason: "Direct win",
			difficulty: calculateDifficulty([pointsToWin], standingPins),
			priority: "Very High",
			expectedOutcome: {
				newScore: targetScore,
				winProbability: 0.7, // Simplified probability
			},
		});
	}

	// Strategy for approaching the target score
	const approachStrategies = calculateApproachStrategies(
		currentPlayer.score,
		targetScore,
		standingPins
	);
	suggestions.push(...approachStrategies);

	// Safety plays to avoid going over
	if (currentPlayer.score >= targetScore - 15) {
		const safetyPlays = calculateSafetyPlays(
			currentPlayer.score,
			targetScore,
			standingPins
		);
		suggestions.push(...safetyPlays);
	}

	// Defensive plays if close to losing
	const otherPlayersClose = players.some(
		(player, index) =>
			index !== currentPlayerIndex && targetScore - player.score <= 10
	);

	if (otherPlayersClose) {
		const defensivePlays = calculateDefensiveStrategies(
			players,
			currentPlayerIndex,
			standingPins,
			targetScore
		);
		suggestions.push(...defensivePlays);
	}

	// Sort suggestions by priority
	return suggestions.sort((a, b) => {
		const priorityOrder = { "Very High": 0, High: 1, Medium: 2, Low: 3 };
		return priorityOrder[a.priority] - priorityOrder[b.priority];
	});
};

/**
 * Calculate difficulty of hitting specified pins based on their layout
 * @param {Array} targetPins - Array of pin numbers to target
 * @param {Array} standingPins - Array of all standing pins
 * @returns {string} Difficulty rating (Easy, Medium, Hard)
 */
const calculateDifficulty = (targetPins, standingPins) => {
	// Simplified difficulty calculation based on number of pins targeted
	if (targetPins.length === 1) {
		// Single pin difficulty based on pin number (higher pins often harder to hit)
		const pinNumber = targetPins[0];
		if (pinNumber <= 4) return "Easy";
		if (pinNumber <= 8) return "Medium";
		return "Hard";
	} else {
		// Multiple pins are harder to hit precisely
		if (targetPins.length <= 2) return "Medium";
		return "Hard";
	}

	// In a real implementation, we would consider:
	// - Relative positions of pins to each other
	// - Obstruction by other pins
	// - Distance between pins
	// - This would require the actual 3D positions from the pin detection
};

/**
 * Calculate strategies to approach the target score
 * @param {number} currentScore - Current player's score
 * @param {number} targetScore - Target score to win
 * @param {Array} standingPins - Array of standing pin numbers
 * @returns {Array} Approach strategies
 */
const calculateApproachStrategies = (
	currentScore,
	targetScore,
	standingPins
) => {
	const strategies = [];
	const pointsToWin = targetScore - currentScore;

	// If far from target, aim for high-value pins
	if (pointsToWin > 12) {
		// Find high-value pins that are standing
		const highValuePins = standingPins.filter((pin) => pin >= 8);

		if (highValuePins.length > 0) {
			strategies.push({
				pins: highValuePins,
				reason: "Increase score quickly with high-value pins",
				difficulty: calculateDifficulty(highValuePins, standingPins),
				priority: "High",
				expectedOutcome: {
					newScore: currentScore + Math.max(...highValuePins),
					remainingToTarget: pointsToWin - Math.max(...highValuePins),
				},
			});
		}

		// Try to hit multiple pins for exactly the number of pins hit
		const multipleGroupedPins = findPinClusters(standingPins);
		if (multipleGroupedPins.length > 0) {
			strategies.push({
				pins: multipleGroupedPins,
				reason: "Hit multiple pins for steady progress",
				difficulty: "Medium",
				priority: "Medium",
				expectedOutcome: {
					newScore: currentScore + multipleGroupedPins.length,
					remainingToTarget: pointsToWin - multipleGroupedPins.length,
				},
			});
		}
	}

	// Mid-range strategy (5-12 points needed)
	if (pointsToWin <= 12 && pointsToWin > 5) {
		// Find combinations of pins that could get close to target
		// For simplicity, just checking if there's a pin with a value close to points needed
		const optimalSinglePin = findClosestPin(standingPins, pointsToWin);
		if (optimalSinglePin) {
			strategies.push({
				pins: [optimalSinglePin],
				reason: `Get close to target score with pin ${optimalSinglePin}`,
				difficulty: calculateDifficulty([optimalSinglePin], standingPins),
				priority: "High",
				expectedOutcome: {
					newScore: currentScore + optimalSinglePin,
					remainingToTarget: pointsToWin - optimalSinglePin,
				},
			});
		}
	}

	return strategies;
};

/**
 * Calculate safe plays to avoid going over the target score
 * @param {number} currentScore - Current player's score
 * @param {number} targetScore - Target score to win
 * @param {Array} standingPins - Array of standing pin numbers
 * @returns {Array} Safety strategies
 */
const calculateSafetyPlays = (currentScore, targetScore, standingPins) => {
	const strategies = [];
	const pointsToWin = targetScore - currentScore;

	// Very close to target (1-5 points needed)
	if (pointsToWin > 0 && pointsToWin <= 5) {
		// Look for exact pin
		if (standingPins.includes(pointsToWin)) {
			strategies.push({
				pins: [pointsToWin],
				reason: `Exact points needed to win`,
				difficulty: calculateDifficulty([pointsToWin], standingPins),
				priority: "Very High",
				expectedOutcome: {
					newScore: targetScore,
					winProbability: 0.7,
				},
			});
		} else {
			// Look for cluster of pins that adds up to points needed
			const combinations = findPinCombinations(standingPins, pointsToWin);
			if (combinations.length > 0) {
				strategies.push({
					pins: combinations[0], // Take first combination
					reason: `Multiple pins totaling ${pointsToWin} points`,
					difficulty: calculateDifficulty(combinations[0], standingPins),
					priority: "High",
					expectedOutcome: {
						newScore: targetScore,
						winProbability: 0.5,
					},
				});
			}

			// If at risk of going over, suggest safe plays
			const safePins = standingPins.filter((pin) => pin < pointsToWin);
			if (safePins.length > 0) {
				const safestPin = Math.max(...safePins);
				strategies.push({
					pins: [safestPin],
					reason: "Safe play to avoid going over",
					difficulty: calculateDifficulty([safestPin], standingPins),
					priority: "Medium",
					expectedOutcome: {
						newScore: currentScore + safestPin,
						remainingToTarget: pointsToWin - safestPin,
					},
				});
			}
		}
	}

	// At exact target
	if (pointsToWin === 0) {
		// Special case: already at target score, need to knock one pin
		const lowestPin = Math.min(...standingPins);
		strategies.push({
			pins: [lowestPin],
			reason: "You're at the target score. Knock one pin to win.",
			difficulty: calculateDifficulty([lowestPin], standingPins),
			priority: "Very High",
			expectedOutcome: {
				winProbability: 0.9,
			},
		});
	}

	// If over target, need to hit exact score to avoid penalty
	if (pointsToWin < 0) {
		strategies.push({
			pins: [],
			reason: "Score will reset to 25. Aim for exactly 50 points.",
			difficulty: "Hard",
			priority: "Very High",
			expectedOutcome: {
				newScore: 25,
				remainingToTarget: targetScore - 25,
			},
		});
	}

	return strategies;
};

/**
 * Calculate defensive strategies when other players are close to winning
 * @param {Array} players - Array of player objects
 * @param {number} currentPlayerIndex - Current player index
 * @param {Array} standingPins - Array of standing pins
 * @param {number} targetScore - Target score to win
 * @returns {Array} Defensive strategies
 */
const calculateDefensiveStrategies = (
	players,
	currentPlayerIndex,
	standingPins,
	targetScore
) => {
	const strategies = [];
	const currentPlayer = players[currentPlayerIndex];

	// Find players who are close to winning
	const threateningPlayers = players
		.map((player, index) => ({ ...player, index }))
		.filter(
			(player) =>
				player.index !== currentPlayerIndex && targetScore - player.score <= 10
		);

	if (threateningPlayers.length > 0) {
		// If we're also close to winning, prioritize our win
		if (targetScore - currentPlayer.score <= 10) {
			return [];
		}

		// Otherwise suggest defensive plays: increase score steadily
		const optimalPin = findClosestPin(standingPins, 6); // Aim for medium progress
		if (optimalPin) {
			strategies.push({
				pins: [optimalPin],
				reason: "Defensive play to keep pace with other players",
				difficulty: calculateDifficulty([optimalPin], standingPins),
				priority: "Medium",
				expectedOutcome: {
					newScore: currentPlayer.score + optimalPin,
					remainingToTarget: targetScore - currentPlayer.score - optimalPin,
				},
			});
		}
	}

	return strategies;
};

/**
 * Find the pin with value closest to the target value
 * @param {Array} pins - Array of pin numbers
 * @param {number} target - Target value
 * @returns {number|null} Closest pin or null if no pins
 */
const findClosestPin = (pins, target) => {
	if (pins.length === 0) return null;
	return pins.reduce((closest, pin) => {
		return Math.abs(pin - target) < Math.abs(closest - target) ? pin : closest;
	}, pins[0]);
};

/**
 * Find clusters of pins that are likely to be hit together
 * Note: In a real implementation, this would use actual pin positions
 * This is a simplified version for demonstration
 * @param {Array} pins - Array of standing pin numbers
 * @returns {Array} A group of pins likely to be hit together
 */
const findPinClusters = (pins) => {
	// Simplified: Just select 2-3 pins randomly
	// In real implementation, we would use the actual spatial positions
	if (pins.length <= 1) return pins;

	const clusterSize = Math.min(Math.floor(Math.random() * 2) + 2, pins.length);
	return pins.slice(0, clusterSize);
};

/**
 * Find combinations of pins that add up to target value
 * @param {Array} pins - Array of pin numbers
 * @param {number} target - Target sum
 * @returns {Array} Array of pin combinations
 */
const findPinCombinations = (pins, target) => {
	const results = [];

	// Simplified algorithm for finding combinations
	// In a real implementation, we would use a more sophisticated approach
	// This is a basic 2-pin combination finder
	for (let i = 0; i < pins.length; i++) {
		for (let j = i + 1; j < pins.length; j++) {
			if (pins[i] + pins[j] === target) {
				results.push([pins[i], pins[j]]);
			}
		}
	}

	return results;
};
