import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState } from '../types';

interface GameHistoryItem {
  id: string;
  date: string;
  players: string[];
  winner: string | null;
  rounds: number;
}

const HistoryScreen = () => {
  const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGameHistory();
  }, []);

  const loadGameHistory = async () => {
    try {
      const historyData = await AsyncStorage.getItem('gameHistory');
      if (historyData) {
        setGameHistory(JSON.parse(historyData));
      }
    } catch (error) {
      console.error('Failed to load game history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all game history?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('gameHistory');
              setGameHistory([]);
            } catch (error) {
              console.error('Failed to clear game history:', error);
              Alert.alert('Error', 'Failed to clear game history');
            }
          },
        },
      ]
    );
  };

  const renderEmptyHistory = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="time-outline" size={80} color="#bdc3c7" />
      <Text style={styles.emptyText}>No game history yet</Text>
      <Text style={styles.emptySubText}>
        Your completed games will appear here
      </Text>
    </View>
  );

  const renderHistoryItem = ({ item }: { item: GameHistoryItem }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyDate}>{item.date}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.rounds} rounds</Text>
        </View>
      </View>
      
      <View style={styles.playersList}>
        <Text style={styles.playersTitle}>Players:</Text>
        <Text style={styles.playersText}>{item.players.join(', ')}</Text>
      </View>
      
      {item.winner && (
        <View style={styles.winnerContainer}>
          <Text style={styles.winnerLabel}>Winner:</Text>
          <Text style={styles.winnerName}>{item.winner}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {gameHistory.length > 0 && (
        <View style={styles.clearButtonContainer}>
          <TouchableOpacity onPress={clearHistory}>
            <Ionicons name="trash-outline" size={24} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading history...</Text>
        </View>
      ) : (
        <FlatList
          data={gameHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          contentContainerStyle={gameHistory.length === 0 ? { flex: 1 } : null}
          ListEmptyComponent={renderEmptyHistory}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  clearButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 10,
    textAlign: 'center',
  },
  historyItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
  },
  badge: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  playersList: {
    marginBottom: 10,
  },
  playersTitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  playersText: {
    fontSize: 16,
  },
  winnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  winnerLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 5,
  },
  winnerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
});

export default HistoryScreen;
