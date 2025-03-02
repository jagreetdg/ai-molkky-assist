/**
 * Game logic for the Mölkky game
 */

// Initialize a new game
export function initGame(playerNames) {
	const players = playerNames.map((name) => ({
		name,
		score: 0,
		consecutiveMisses: 0,
		eliminated: false,
	}));

	return {
		players,
		currentPlayerIndex: 0,
		rounds: [],
		targetScore: 50,
		gameComplete: false,
		winner: null,
	};
}

// Update score for current player
export function updateScore(gameState, points) {
	const newState = { ...gameState };
	const currentPlayer = { ...newState.players[newState.currentPlayerIndex] };

	// Apply score
	if (points === 0) {
		// Miss - increment consecutive misses
		currentPlayer.consecutiveMisses += 1;

		// Check if player is eliminated (3 consecutive misses)
		if (currentPlayer.consecutiveMisses >= 3) {
			currentPlayer.eliminated = true;
		}
	} else {
		// Hit - reset consecutive misses
		currentPlayer.consecutiveMisses = 0;

		// Add points
		const newScore = currentPlayer.score + points;

		// Check if over 50 (reset to 25)
		if (newScore > 50) {
			currentPlayer.score = 25;
		} else {
			currentPlayer.score = newScore;
		}
	}

	// Update player in state
	newState.players[newState.currentPlayerIndex] = currentPlayer;

	// Record round
	if (!newState.rounds) newState.rounds = [];

	newState.rounds.push({
		round: newState.rounds.length + 1,
		scores: [
			{
				playerName: currentPlayer.name,
				points: points,
			},
		],
	});

	// Move to next player (skip eliminated players)
	newState.currentPlayerIndex = getNextPlayerIndex(newState);

	return newState;
}

// Get the next player index, skipping eliminated players
function getNextPlayerIndex(gameState) {
	let nextIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;

	// Skip eliminated players
	while (
		gameState.players[nextIndex].eliminated &&
		!allPlayersEliminated(gameState.players)
	) {
		nextIndex = (nextIndex + 1) % gameState.players.length;
	}

	return nextIndex;
}

// Check if all players are eliminated
function allPlayersEliminated(players) {
	return players.every((player) => player.eliminated);
}

// Get current player index
export function getCurrentPlayer(gameState) {
	return gameState.currentPlayerIndex;
}

// Check if the game is over
export function checkGameOver(gameState) {
	// Check if any player has reached exactly 50 points
	const winnerIndex = gameState.players.findIndex(
		(player) => player.score === gameState.targetScore
	);

	if (winnerIndex !== -1) {
		return {
			isOver: true,
			winner: gameState.players[winnerIndex].name,
		};
	}

	// Check if all players except one are eliminated
	const activePlayers = gameState.players.filter((p) => !p.eliminated);
	if (activePlayers.length === 1 && gameState.players.length > 1) {
		return {
			isOver: true,
			winner: activePlayers[0].name,
		};
	}

	// Check if all players are eliminated (draw)
	if (allPlayersEliminated(gameState.players)) {
		return {
			isOver: true,
			winner: "Nobody",
		};
	}

	return { isOver: false };
}
