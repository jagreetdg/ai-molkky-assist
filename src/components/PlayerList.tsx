import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface PlayerListProps {
  players: string[];
  onPlayersChange: (players: string[]) => void;
  minPlayers?: number;
  maxPlayers?: number;
}

const PlayerList: React.FC<PlayerListProps> = ({
  players,
  onPlayersChange,
  minPlayers = 2,
  maxPlayers = 10,
}) => {
  const { colors } = useTheme();
  const [newPlayerName, setNewPlayerName] = useState('');

  const addPlayer = () => {
    if (!newPlayerName.trim()) {
      Alert.alert('Error', 'Player name cannot be empty');
      return;
    }

    if (players.length >= maxPlayers) {
      Alert.alert('Error', `Maximum ${maxPlayers} players allowed`);
      return;
    }

    if (players.includes(newPlayerName.trim())) {
      Alert.alert('Error', 'Player name already exists');
      return;
    }

    onPlayersChange([...players, newPlayerName.trim()]);
    setNewPlayerName('');
  };

  const removePlayer = (index: number) => {
    if (players.length <= minPlayers) {
      Alert.alert('Error', `Minimum ${minPlayers} players required`);
      return;
    }

    const updatedPlayers = [...players];
    updatedPlayers.splice(index, 1);
    onPlayersChange(updatedPlayers);
  };

  const renderPlayerItem = ({ item, index }: { item: string; index: number }) => (
    <View style={[styles.playerItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.playerName, { color: colors.text }]}>{item}</Text>
      <TouchableOpacity onPress={() => removePlayer(index)}>
        <Ionicons name="close-circle" size={24} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Players</Text>
      
      <View style={styles.addPlayerContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="Enter player name"
          placeholderTextColor={colors.text + '80'}
          value={newPlayerName}
          onChangeText={setNewPlayerName}
          onSubmitEditing={addPlayer}
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={addPlayer}
          disabled={players.length >= maxPlayers}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {players.length > 0 ? (
        <FlatList
          data={players}
          keyExtractor={(item, index) => `player-${index}`}
          renderItem={renderPlayerItem}
          style={styles.playerList}
        />
      ) : (
        <Text style={[styles.emptyText, { color: colors.text + '80' }]}>
          Add at least {minPlayers} players to start the game
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  addPlayerContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerList: {
    maxHeight: 300,
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  playerName: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default PlayerList;
