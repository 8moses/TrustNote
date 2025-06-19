import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';

import { db } from '../../services/firebase/config';
// --- 1. Import the new functions we need ---
import { getFriendsList, inviteFriendToGame, startGame, getMostLikelyToQuestions } from '../../services/firebase/firestore';
import Button from '../../components/common/Button';

// A utility function to shuffle the questions for variety
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const GameLobbyScreen = ({ route, navigation }) => {
  const { roomId } = route.params;
  const currentUserProfile = useSelector((state) => state.auth.profile);

  const [gameRoom, setGameRoom] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invitedFriendIds, setInvitedFriendIds] = useState([]);
  // --- 2. Add a new state to show the "Starting..." message ---
  const [isStartingGame, setIsStartingGame] = useState(false);

  // --- 3. This useEffect now also navigates when the game starts ---
  useEffect(() => {
    if (!roomId) return;
    const roomRef = doc(db, 'gameRooms', roomId);
    const unsubscribe = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        const gameData = doc.data();
        setGameRoom({ id: doc.id, ...gameData });
        
        // When the host starts the game, this will trigger for all players
        if (gameData.status === 'in_progress') {
          // Use .replace() so users can't go "back" to the lobby
          navigation.replace('MostLikelyToGame', { roomId: doc.id });
        }
      } else {
        Alert.alert("Error", "Game room not found.", [{ text: "OK", onPress: () => navigation.goBack() }]);
      }
    });
    return () => unsubscribe();
  }, [roomId, navigation]);

  useEffect(() => {
    const fetchFriends = async () => {
      if (currentUserProfile?.uid) {
        const friendsList = await getFriendsList(currentUserProfile.uid);
        setFriends(friendsList);
        setLoading(false);
      }
    };
    fetchFriends();
  }, [currentUserProfile]);
  
  const handleInvite = async (friend) => {
    if (gameRoom?.playerIds?.includes(friend.id)) {
        Alert.alert("Already in Lobby", `${friend.displayName} is already in the game.`);
        return;
    }
    await inviteFriendToGame(roomId, currentUserProfile, friend);
    setInvitedFriendIds(prev => [...prev, friend.id]);
  };

  // --- 4. This is the new, fully functional start game handler ---
  const handleStartGame = async () => {
    if (gameRoom.players.length < 2) {
      Alert.alert("Not Enough Players", "You need at least 2 players to start the game.");
      return;
    }
    setIsStartingGame(true);
    try {
        const allQuestions = await getMostLikelyToQuestions();
        if (allQuestions.length < 10) {
            Alert.alert("Not Enough Questions", "There aren't enough questions in the database to start a game.");
            setIsStartingGame(false);
            return;
        }
        const selectedQuestions = shuffleArray(allQuestions).slice(0, 10);
        await startGame(roomId, selectedQuestions);
        // We don't need to navigate here; the onSnapshot listener will handle it for everyone.
    } catch (error) {
        console.error("Failed to start game:", error);
        Alert.alert("Error", "Could not start the game.");
        setIsStartingGame(false);
    }
  };

  const renderPlayer = ({ item }) => (
    <View style={styles.playerChip}>
      <Image source={{ uri: item.avatar }} style={styles.playerAvatar} />
      <Text style={styles.playerText}>{item.displayName}</Text>
      {item.isHost && <Ionicons name="key-outline" size={14} color="#FFD700" style={{marginLeft: 5}}/>}
    </View>
  );

  const renderFriend = ({ item }) => {
    const hasJoined = gameRoom?.playerIds?.includes(item.id);
    const hasBeenInvited = invitedFriendIds.includes(item.id);
    const isDisabled = hasJoined || hasBeenInvited;

    return (
        <View style={styles.friendCard}>
        <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
        <Text style={styles.friendName}>{item.displayName}</Text>
        <TouchableOpacity 
            style={[styles.inviteButton, isDisabled && styles.inviteButtonDisabled]}
            onPress={() => handleInvite(item)}
            disabled={isDisabled}
        >
            <Text style={styles.inviteButtonText}>{hasJoined ? 'Joined' : hasBeenInvited ? 'Invited' : 'Invite'}</Text>
        </TouchableOpacity>
        </View>
    );
  };
  
  if (!gameRoom || loading) {
    return <ActivityIndicator style={{flex: 1, backgroundColor: '#121212'}} size="large" color="#FFFFE0"/>
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Game Lobby</Text>
        <View style={{ width: 26 }} />
      </View>
      
      <Text style={styles.sectionTitle}>Players ({gameRoom.players.length}/{gameRoom.maxPlayers})</Text>
      <FlatList
        data={gameRoom.players}
        renderItem={renderPlayer}
        keyExtractor={(item) => item.uid}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      />
      
      <Text style={styles.sectionTitle}>Invite Friends</Text>
      <FlatList
        data={friends}
        renderItem={renderFriend}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        ListEmptyComponent={<Text style={styles.emptyText}>You have no friends to invite.</Text>}
      />

      {/* --- 5. The Start Game button now uses the isStartingGame state --- */}
      {gameRoom.createdBy === currentUserProfile.uid && (
        <View style={styles.footer}>
            <Button 
                title={isStartingGame ? "Starting..." : "Start Game"} 
                onPress={handleStartGame} 
                disabled={gameRoom.players.length < 2 || isStartingGame}
            />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1c1c1c' },
    headerTitle: { fontFamily: 'PressStart2P', color: 'white', fontSize: 18 },
    sectionTitle: { fontFamily: 'PressStart2P', color: '#888', fontSize: 12, paddingHorizontal: 20, marginTop: 20, marginBottom: 10, },
    playerChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c1c', borderRadius: 20, padding: 5, paddingRight: 10, marginRight: 10 },
    playerAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
    playerText: { color: 'white', fontSize: 12 },
    friendCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c1c', padding: 15, borderRadius: 10, marginBottom: 10, },
    friendAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 15, },
    friendName: { flex: 1, fontFamily: 'PressStart2P', color: 'white', fontSize: 14, },
    inviteButton: { backgroundColor: '#4CAF50', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
    inviteButtonDisabled: { backgroundColor: '#555' },
    inviteButtonText: { color: 'white', fontWeight: 'bold' },
    emptyText: { color: '#555', textAlign: 'center', marginTop: 30, fontFamily: 'PressStart2P', fontSize: 12, },
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#1c1c1c' },
});

export default GameLobbyScreen;