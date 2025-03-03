import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList,
  Alert,
  Modal,
  Animated,
  BackHandler,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useFocusEffect, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Player, GameState } from '../types';
import { getActivePlayer, getPlayerRanking } from '../services/gameService';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import ScoreButton from '../components/ScoreButton';
import PlayerScoreCard from '../components/PlayerScoreCard';
import MissIndicator from '../components/MissIndicator';

type GamePlayScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GamePlay'>;

const GamePlayScreen = () => {
  const navigation = useNavigation<GamePlayScreenNavigationProp>();
  const { colors } = useTheme();
  const { gameState: contextGameState, updatePlayerScore, resetGame, undoLastMove, initGame } = useGame();
  const [showScoreButtons, setShowScoreButtons] = useState(true);
  const [selectedPin, setSelectedPin] = useState<number | null>(null);
  const [localGameState, setLocalGameState] = useState<GameState | null>(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showUndoModal, setShowUndoModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [scoreUpdateInfo, setScoreUpdateInfo] = useState<{
    playerName: string;
    previousScore: number;
    newScore: number;
    scoreAdded: number;
    consecutiveMisses: number;
  } | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const gameOverFadeAnim = useState(new Animated.Value(0))[0];
  const undoFadeAnim = useState(new Animated.Value(0))[0];
  const resetFadeAnim = useState(new Animated.Value(0))[0];
  
  // Ensure we have a valid game state from context
  const gameState = contextGameState;

  // Initialize local state from context when it changes
  useEffect(() => {
    console.log("GamePlayScreen: useEffect for syncing local state triggered");
    console.log(" - Context game state:", contextGameState);
    console.log(" - Local game state:", localGameState);
    
    if (contextGameState && JSON.stringify(contextGameState) !== JSON.stringify(localGameState)) {
      console.log("GamePlayScreen: Syncing local state with context state");
      setLocalGameState({...contextGameState});
    }
  }, [contextGameState, localGameState]);

  // Check game state when screen gains focus
  useFocusEffect(
    useCallback(() => {
      console.log("GamePlayScreen: useFocusEffect triggered with:");
      console.log(" - Context game state:", contextGameState);
      console.log(" - Local game state:", localGameState);
      
      // If we have a local state but no context state, update the context
      if (!contextGameState && localGameState) {
        console.log("GamePlayScreen: Context state is null but local state exists, using local state");
        // We need to re-initialize the game with the player names from local state
        if (localGameState.players) {
          const playerNames = localGameState.players.map(p => p.name);
          initGame(playerNames);
        }
        return;
      }
      
      // If we have no game state at all, navigate back to setup
      if (!contextGameState && !localGameState) {
        console.log("GamePlayScreen: No game state available, navigating back to GameSetup");
        navigation.navigate('GameSetup');
        return;
      }
      
    }, [contextGameState, localGameState, navigation, initGame])
  );

  // Handle game over
  useEffect(() => {
    let isMounted = true; // Track if component is still mounted
    
    // Fix for game over modal being triggered repeatedly
    // Only show the modal once and only when the game transitions to over state
    if (gameState?.gameOver && !showGameOverModal && !localGameState?.gameOver) {
      // Update local game state to track when we've shown the modal
      setLocalGameState(gameState);
      
      // Show the custom game over modal instead of the Alert
      if (isMounted) {
        setShowGameOverModal(true);
        
        // Animate the fade in
        Animated.timing(gameOverFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }).start();
      }
    } else if (!gameState?.gameOver && localGameState?.gameOver) {
      // Reset local game state tracking when game is no longer over
      if (isMounted) {
        setLocalGameState(gameState);
      }
    }
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [gameState, localGameState, gameOverFadeAnim, showGameOverModal]);

  // Handle hardware back button
  useEffect(() => {
    const handleBackPress = () => {
      // Show reset confirmation on hardware back button press
      if (!showResetModal && !showGameOverModal && !showUndoModal && !showScoreModal) {
        // Same behavior as the reset button
        setShowResetModal(true);
        
        // Animate the fade in
        Animated.timing(resetFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }).start();
      } else {
        // If there's an open modal, close it instead
        if (showResetModal) {
          handleCloseResetModal();
        } else if (showGameOverModal) {
          handleCloseGameOverModal();
        } else if (showUndoModal) {
          handleCloseUndoModal();
        } else if (showScoreModal) {
          handleCloseScoreModal();
        }
      }
      return true; // Prevent default back behavior
    };

    // Add event listener for hardware back button
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    // Clean up the event listener on component unmount
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [showResetModal, showGameOverModal, showUndoModal, showScoreModal, resetFadeAnim]);

  const handlePinSelection = (pin: number) => {
    // Don't allow pin selection if game is over
    if (gameState?.gameOver) return;
    
    // If the pin is already selected, deselect it
    if (selectedPin === pin) {
      setSelectedPin(null);
    } else {
      // Otherwise, select the new pin
      setSelectedPin(pin);
    }
  };

  const handleScoreSubmit = () => {
    // Don't allow score submission if game is over
    if (gameState?.gameOver) return;
    
    // If no pin is selected, treat it as a miss (0)
    const score = selectedPin !== null ? selectedPin : 0;
    
    if (!gameState) return; // Guard clause for type safety
    
    const activePlayer = getActivePlayer(gameState);
    if (!activePlayer) return; // Guard clause for type safety
    
    const previousScore = activePlayer.score;
    const isLastPlayer = gameState?.players.findIndex(p => p.id === activePlayer.id) === gameState.players.length - 1;
    
    // Animate the fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
    
    // Update the player's score through context
    updatePlayerScore(score);
    
    // Set score update info for the modal
    setScoreUpdateInfo({
      playerName: activePlayer.name,
      previousScore,
      newScore: score === 0 
        ? previousScore 
        : (previousScore + score <= 50 ? previousScore + score : 25),
      scoreAdded: score,
      consecutiveMisses: score === 0 ? activePlayer.consecutiveMisses + 1 : 0
    });
    
    // Show the modal but check if game is over first 
    // If game is now over, the Game Over modal will show instead
    if (!gameState?.gameOver) {
      setShowScoreModal(true);
    }
    
    // Reset selected pin after scoring
    setSelectedPin(null);
  };

  const handleUndoPress = () => {
    // Show the undo modal
    setShowUndoModal(true);
    
    // Animate the fade in
    Animated.timing(undoFadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  };

  const confirmUndo = () => {
    // Perform the undo action
    undoLastMove();
    
    // Close the modal with animation
    handleCloseUndoModal();
  };

  const handleCloseScoreModal = () => {
    // Stop any ongoing animations
    fadeAnim.stopAnimation();
    
    // Animate the fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      setShowScoreModal(false);
      
      // Reset fadeAnim to 0 to ensure it's ready for next animation
      fadeAnim.setValue(0);
    });
  };

  const handleCloseUndoModal = () => {
    // Stop any ongoing animations
    undoFadeAnim.stopAnimation();
    
    // Animate the fade out
    Animated.timing(undoFadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      setShowUndoModal(false);
      
      // Reset undoFadeAnim to 0 to ensure it's ready for next animation
      undoFadeAnim.setValue(0);
    });
  };

  const handleCloseResetModal = () => {
    // Stop any ongoing animations
    resetFadeAnim.stopAnimation();
    
    // Animate the fade out
    Animated.timing(resetFadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      setShowResetModal(false);
      
      // Reset resetFadeAnim to 0 to ensure it's ready for next animation
      resetFadeAnim.setValue(0);
    });
  };

  const handleCloseGameOverModal = () => {
    // Stop any ongoing animations
    gameOverFadeAnim.stopAnimation();
    
    // Animate the fade out
    Animated.timing(gameOverFadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      setShowGameOverModal(false);
      
      // Reset gameOverFadeAnim to 0 to ensure it's ready for next animation
      gameOverFadeAnim.setValue(0);
    });
  };

  const handleResetPress = () => {
    // Show the custom reset modal instead of the Alert
    setShowResetModal(true);
    
    // Animate the fade in
    Animated.timing(resetFadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  };

  const handleCameraPress = () => {
    // Don't allow camera access if game is over
    if (gameState?.gameOver) return;
    
    // Navigate directly to the Camera screen
    navigation.navigate('Camera');
  };

  const handleNewGame = () => {
    // Reset the game and navigate to setup
    resetGame();
    navigation.navigate('GameSetup');
    
    // Close the modal with animation
    handleCloseGameOverModal();
  };

  const handleResetConfirm = () => {
    // Reset the game
    resetGame();
    
    // Close the modal with animation
    handleCloseResetModal();
  };

  if (!gameState || !gameState.players || gameState.players.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.noGameText, { color: colors.text }]}>No active game found.</Text>
        <TouchableOpacity
          style={[styles.newGameButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('GameSetup')}
        >
          <Text style={styles.newGameButtonText}>Start New Game</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!gameState) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          No active game found. Please start a new game.
        </Text>
        <TouchableOpacity
          style={[styles.newGameButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('GameSetup')}
        >
          <Text style={styles.newGameButtonText}>Start New Game</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activePlayer = getActivePlayer(gameState);
  // Use the original player order instead of ranking by score
  const playersList = gameState.players || [];

  // Define the pins in the actual Mölkky board layout
  // Front row (closest to the player)
  const frontRow = [7, 9, 8];
  // Second row
  const secondRow = [5, 11, 12, 6];
  // Third row
  const thirdRow = [3, 10, 4];
  // Back row (furthest from the player)
  const backRow = [1, 2];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Current Player Section */}
      <View style={styles.currentPlayerSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {gameState?.gameOver ? 'Game Over' : 'Current Player'}
          </Text>
        </View>
        {gameState?.gameOver ? (
          <View style={[styles.activePlayerCard, { backgroundColor: colors.card }]}>
            <View style={styles.activePlayerHeader}>
              <Text style={[styles.playerName, { color: colors.text }]}>
                {gameState.winner ? `${gameState.winner.name} Wins!` : 'Game Over'}
              </Text>
            </View>
            {gameState.winner && (
              <Text style={[styles.playerScore, { color: colors.text }]}>
                Final Score: {gameState.winner.score}
              </Text>
            )}
          </View>
        ) : activePlayer ? (
          <View style={[styles.activePlayerCard, { backgroundColor: colors.card }]}>
            <View style={styles.activePlayerHeader}>
              <Text style={[styles.playerName, { color: colors.text }]}>{activePlayer.name}</Text>
              <MissIndicator 
                consecutiveMisses={activePlayer.consecutiveMisses} 
                size="medium" 
                colors={colors}
              />
            </View>
            <Text style={[styles.playerScore, { color: colors.text }]}>Score: {activePlayer.score}</Text>
          </View>
        ) : (
          <Text style={[styles.noActivePlayer, { color: colors.text }]}>No active player</Text>
        )}
      </View>

      {/* Score Buttons or Camera Button */}
      <View style={styles.actionSection}>
        {showScoreButtons ? (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Pin</Text>
            </View>
            <View style={styles.scoreButtonsContainer}>
              {/* Front row */}
              <View style={styles.scoreButtonsRow}>
                {frontRow.map(pin => (
                  <ScoreButton 
                    key={pin}
                    value={pin} 
                    selected={selectedPin === pin} 
                    onPress={() => handlePinSelection(pin)} 
                    color={selectedPin === pin ? colors.accent : colors.primary} 
                    disabled={gameState?.gameOver}
                  />
                ))}
              </View>
              
              {/* Second row */}
              <View style={styles.scoreButtonsRow}>
                {secondRow.map(pin => (
                  <ScoreButton 
                    key={pin}
                    value={pin} 
                    selected={selectedPin === pin} 
                    onPress={() => handlePinSelection(pin)} 
                    color={selectedPin === pin ? colors.accent : colors.primary} 
                    disabled={gameState?.gameOver}
                  />
                ))}
              </View>
              
              {/* Third row */}
              <View style={styles.scoreButtonsRow}>
                {thirdRow.map(pin => (
                  <ScoreButton 
                    key={pin}
                    value={pin} 
                    selected={selectedPin === pin} 
                    onPress={() => handlePinSelection(pin)} 
                    color={selectedPin === pin ? colors.accent : colors.primary} 
                    disabled={gameState?.gameOver}
                  />
                ))}
              </View>
              
              {/* Back row */}
              <View style={styles.scoreButtonsRow}>
                {backRow.map(pin => (
                  <ScoreButton 
                    key={pin}
                    value={pin} 
                    selected={selectedPin === pin} 
                    onPress={() => handlePinSelection(pin)} 
                    color={selectedPin === pin ? colors.accent : colors.primary} 
                    disabled={gameState?.gameOver}
                  />
                ))}
              </View>
            </View>
            
            {/* Action Buttons Row */}
            <View style={styles.actionButtonsRow}>
              {/* Score Submit Button */}
              <TouchableOpacity
                style={[
                  styles.scoreSubmitButton, 
                  { 
                    backgroundColor: gameState?.gameOver ? colors.disabled : colors.success, 
                    flex: 2,
                    opacity: gameState?.gameOver ? 0.5 : 1
                  }
                ]}
                onPress={handleScoreSubmit}
                disabled={gameState?.gameOver}
              >
                <Text style={styles.scoreSubmitButtonText}>
                  Score {selectedPin !== null ? selectedPin : '0'}
                </Text>
              </TouchableOpacity>
              
              {/* Undo Button */}
              <TouchableOpacity
                style={[styles.undoButton, { backgroundColor: colors.warning, flex: 1 }]}
                onPress={handleUndoPress}
              >
                <Ionicons name="arrow-undo" size={24} color="white" />
              </TouchableOpacity>
              
              {/* Reset Button */}
              <TouchableOpacity
                style={[styles.resetButton, { backgroundColor: colors.error, flex: 1 }]}
                onPress={handleResetPress}
              >
                <Ionicons name="refresh" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            {/* Camera Button Row */}
            <View style={styles.cameraButtonRow}>
              <TouchableOpacity
                style={[
                  styles.cameraButton, 
                  { 
                    backgroundColor: gameState?.gameOver ? colors.disabled : colors.primary,
                    opacity: gameState?.gameOver ? 0.5 : 1
                  }
                ]}
                onPress={handleCameraPress}
                disabled={gameState?.gameOver}
              >
                <Ionicons name="camera-outline" size={24} color="white" />
                <Text style={styles.cameraButtonText}>Analyze with AI</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          // Camera view
          <>
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={[styles.cameraButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowScoreButtons(true)}
              >
                <Ionicons name="keypad-outline" size={24} color="white" />
                <Text style={styles.cameraButtonText}>Manual Entry</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Players List */}
      <View style={styles.rankingsSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Players List</Text>
        </View>
        <FlatList
          data={playersList}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <PlayerScoreCard
              player={item}
              rank={index + 1}
              isActive={item.isActive}
              isEliminated={item.isEliminated}
              colors={colors}
            />
          )}
          style={styles.rankingsList}
          contentContainerStyle={styles.rankingsListContent}
        />
      </View>

      {/* Score Update Modal */}
      <Modal
        visible={showScoreModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseScoreModal}
      >
        <TouchableOpacity 
          style={styles.scoreUpdateModalContainer}
          activeOpacity={1}
          onPress={handleCloseScoreModal}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
          >
            <Animated.View style={[styles.scoreUpdateModal, { opacity: fadeAnim, backgroundColor: colors.card }]}>
              <View style={styles.scoreUpdateModalHeader}>
                <Text style={[styles.scoreUpdateModalTitle, { color: colors.text }]}>Score Update</Text>
                <TouchableOpacity
                  style={styles.scoreUpdateModalCloseButton}
                  onPress={handleCloseScoreModal}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.scoreUpdateModalContent}>
                {scoreUpdateInfo && (
                  <>
                    <View style={styles.playerInfoRow}>
                      <Ionicons name="person" size={24} color={colors.primary} />
                      <Text style={[styles.playerInfoText, { color: colors.text }]}>
                        {scoreUpdateInfo.playerName}
                      </Text>
                    </View>
                    
                    <View style={styles.scoreChangeContainer}>
                      <View style={styles.scoreBox}>
                        <Text style={[styles.scoreLabel, { color: colors.text }]}>Previous</Text>
                        <Text style={[styles.scoreValue, { color: colors.text }]}>{scoreUpdateInfo.previousScore}</Text>
                      </View>
                      
                      <View style={styles.scoreArrow}>
                        <Ionicons 
                          name="arrow-forward" 
                          size={24} 
                          color={scoreUpdateInfo.scoreAdded > 0 ? colors.success : colors.warning} 
                        />
                      </View>
                      
                      <View style={styles.scoreBox}>
                        <Text style={[styles.scoreLabel, { color: colors.text }]}>New</Text>
                        <Text style={[styles.scoreValue, { color: colors.text }]}>{scoreUpdateInfo.newScore}</Text>
                      </View>
                    </View>
                    
                    <View style={[styles.scoreAddedContainer, { 
                      backgroundColor: scoreUpdateInfo.scoreAdded > 0 
                        ? 'rgba(75, 181, 67, 0.1)' 
                        : 'rgba(255, 193, 7, 0.1)' 
                    }]}>
                      <Ionicons 
                        name={scoreUpdateInfo.scoreAdded > 0 ? "add-circle" : "remove-circle"} 
                        size={24} 
                        color={scoreUpdateInfo.scoreAdded > 0 ? colors.success : colors.warning} 
                      />
                      <Text style={[styles.scoreAddedText, { 
                        color: scoreUpdateInfo.scoreAdded > 0 ? colors.success : colors.warning 
                      }]}>
                        {scoreUpdateInfo.scoreAdded > 0 
                          ? `Added ${scoreUpdateInfo.scoreAdded} points` 
                          : 'Missed shot'}
                      </Text>
                    </View>
                    
                    {scoreUpdateInfo.consecutiveMisses > 0 && (
                      <View style={styles.missesContainer}>
                        <MissIndicator 
                          consecutiveMisses={scoreUpdateInfo.consecutiveMisses} 
                          size="small" 
                          colors={colors}
                        />
                        <Text style={[styles.missesText, { color: colors.text }]}>
                          {scoreUpdateInfo.consecutiveMisses === 1 
                            ? '1 consecutive miss' 
                            : `${scoreUpdateInfo.consecutiveMisses} consecutive misses`}
                          {scoreUpdateInfo.consecutiveMisses >= 3 && ' - Eliminated!'}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
              
              <TouchableOpacity
                style={[styles.closeModalButton, { backgroundColor: colors.primary, alignSelf: 'center' }]}
                onPress={handleCloseScoreModal}
              >
                <Text style={styles.closeModalButtonText}>Continue</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Game Over Modal */}
      <Modal
        visible={showGameOverModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseGameOverModal}
      >
        <TouchableOpacity 
          style={styles.scoreUpdateModalContainer}
          activeOpacity={1}
          onPress={handleCloseGameOverModal}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
          >
            <Animated.View style={[styles.scoreUpdateModal, { opacity: gameOverFadeAnim, backgroundColor: colors.card }]}>
              <View style={styles.scoreUpdateModalHeader}>
                <Text style={[styles.scoreUpdateModalTitle, { color: colors.text }]}>Game Over</Text>
                <TouchableOpacity
                  style={styles.scoreUpdateModalCloseButton}
                  onPress={handleCloseGameOverModal}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.scoreUpdateModalContent}>
                {/* Winning Player Info */}
                {gameState?.winner && (
                  <>
                    <View style={styles.playerInfoRow}>
                      <Ionicons name="trophy" size={24} color={colors.primary} />
                      <Text style={[styles.playerInfoText, { color: colors.text, fontWeight: 'bold' }]}>
                        {gameState.winner.name} Wins!
                      </Text>
                    </View>
                    
                    {/* Score Info */}
                    <View style={styles.scoreChangeContainer}>
                      <View style={styles.scoreBox}>
                        <Text style={[styles.scoreLabel, { color: colors.text }]}>Final Score</Text>
                        <Text style={[styles.scoreValue, { color: colors.text }]}>{gameState.winner.score}</Text>
                      </View>
                    </View>

                    {/* Show Last Move if scoreUpdateInfo exists */}
                    {scoreUpdateInfo && (
                      <>
                        <View style={[styles.scoreAddedContainer, { 
                          backgroundColor: 'rgba(75, 181, 67, 0.1)',
                          marginTop: 15
                        }]}>
                          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                          <Text style={[styles.scoreAddedText, { color: colors.success }]}>
                            Game-Winning Move!
                          </Text>
                        </View>
                      </>
                    )}
                  </>
                )}
              </View>
              
              <View style={styles.gameOverButtonsContainer}>
                <TouchableOpacity
                  style={[styles.gameOverButton, { backgroundColor: colors.primary }]}
                  onPress={handleNewGame}
                >
                  <Text style={styles.gameOverButtonText}>New Game</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.gameOverButton, { backgroundColor: colors.accent }]}
                  onPress={handleCloseGameOverModal}
                >
                  <Text style={styles.gameOverButtonText}>View Results</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Undo Modal */}
      <Modal
        visible={showUndoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseUndoModal}
      >
        <TouchableOpacity 
          style={styles.scoreUpdateModalContainer}
          activeOpacity={1}
          onPress={handleCloseUndoModal}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
          >
            <Animated.View style={[styles.scoreUpdateModal, { opacity: undoFadeAnim, backgroundColor: colors.card }]}>
              <View style={styles.scoreUpdateModalHeader}>
                <Text style={[styles.scoreUpdateModalTitle, { color: colors.text }]}>Undo Last Move</Text>
                <TouchableOpacity
                  style={styles.scoreUpdateModalCloseButton}
                  onPress={handleCloseUndoModal}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.scoreUpdateModalContent}>
                <Text style={[styles.scoreUpdateModalText, { color: colors.text, fontSize: 16, marginBottom: 15, textAlign: 'center' }]}>
                  Are you sure you want to undo the last move? This action cannot be undone.
                </Text>
              </View>
              
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={[styles.undoButton, { backgroundColor: colors.warning, flex: 1 }]}
                  onPress={handleCloseUndoModal}
                >
                  <Text style={styles.undoButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.resetButton, { backgroundColor: colors.error, flex: 1 }]}
                  onPress={confirmUndo}
                >
                  <Text style={styles.resetButtonText}>Undo</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Reset Modal */}
      <Modal
        visible={showResetModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseResetModal}
      >
        <TouchableOpacity 
          style={styles.scoreUpdateModalContainer}
          activeOpacity={1}
          onPress={handleCloseResetModal}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
          >
            <Animated.View style={[styles.scoreUpdateModal, { opacity: resetFadeAnim, backgroundColor: colors.card }]}>
              <View style={styles.scoreUpdateModalHeader}>
                <Text style={[styles.scoreUpdateModalTitle, { color: colors.text }]}>Reset Game</Text>
                <TouchableOpacity
                  style={styles.scoreUpdateModalCloseButton}
                  onPress={handleCloseResetModal}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.scoreUpdateModalContent}>
                <Text style={[styles.scoreUpdateModalText, { color: colors.text, fontSize: 16, marginBottom: 15, textAlign: 'center' }]}>
                  Are you sure you want to reset the entire game? This action cannot be undone.
                </Text>
              </View>
              
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={[styles.undoButton, { backgroundColor: colors.warning, flex: 1 }]}
                  onPress={handleCloseResetModal}
                >
                  <Text style={styles.undoButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.resetButton, { backgroundColor: colors.error, flex: 1 }]}
                  onPress={handleResetConfirm}
                >
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  currentPlayerSection: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activePlayerCard: {
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  activePlayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  playerScore: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  actionSection: {
    marginBottom: 12,
  },
  scoreButtonsContainer: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scoreSubmitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    marginRight: 10,
  },
  scoreSubmitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  undoButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    marginRight: 10,
  },
  resetButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  cameraButtonRow: {
    marginBottom: 16,
  },
  cameraButton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  rankingsSection: {
    flex: 1,
  },
  rankingsList: {
    flex: 1,
  },
  rankingsListContent: {
    paddingTop: 8,
  },
  noGameText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  newGameButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newGameButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noActivePlayer: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  scoreUpdateModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scoreUpdateModal: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '80%',
  },
  scoreUpdateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreUpdateModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreUpdateModalCloseButton: {
    padding: 8,
  },
  scoreUpdateModalContent: {
    marginBottom: 16,
  },
  scoreUpdateModalText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  playerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerInfoText: {
    fontSize: 16,
    marginLeft: 8,
  },
  scoreChangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreBox: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    width: '30%',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreArrow: {
    width: '30%',
    alignItems: 'center',
  },
  scoreAddedContainer: {
    padding: 8,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreAddedText: {
    fontSize: 16,
    marginLeft: 8,
  },
  missesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  missesText: {
    fontSize: 16,
    marginLeft: 8,
  },
  closeModalButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    width: '100%',
    alignSelf: 'center',
  },
  closeModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  undoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameOverButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    width: '100%',
  },
  gameOverButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  gameOverButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GamePlayScreen;
