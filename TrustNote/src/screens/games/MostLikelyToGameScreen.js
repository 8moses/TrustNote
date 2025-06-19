import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase/config';

// This is a reusable component for the player choices
const PlayerVoteCard = ({ player, isSelected, onSelect }) => (
    <TouchableOpacity 
        style={[styles.playerCard, isSelected && styles.playerCardSelected]}
        onPress={() => onSelect(player.uid)}
    >
        <Text style={styles.playerCardName}>{player.displayName}</Text>
    </TouchableOpacity>
);

const MostLikelyToGameScreen = ({ route, navigation }) => {
    const { roomId } = route.params;
    const [gameRoom, setGameRoom] = useState(null);
    const [selectedPlayerId, setSelectedPlayerId] = useState(null);

    // This effect listens for real-time game updates
    useEffect(() => {
        const roomRef = doc(db, 'gameRooms', roomId);
        const unsubscribe = onSnapshot(roomRef, (doc) => {
            if (doc.exists()) {
                setGameRoom({ id: doc.id, ...doc.data() });
            } else {
                Alert.alert("Game Over", "The host has ended the game.", [{ text: "OK", onPress: () => navigation.navigate('Home') }]);
            }
        });
        return () => unsubscribe();
    }, [roomId, navigation]);

    const handleVote = () => {
        if (!selectedPlayerId) {
            Alert.alert("No Selection", "Please choose a player before voting.");
            return;
        }
        // TODO: Implement the voting logic here in the next step
        console.log(`Voted for: ${selectedPlayerId}`);
        Alert.alert("Vote Cast!", "Waiting for other players...");
    };

    if (!gameRoom) {
        return <ActivityIndicator style={{ flex: 1, backgroundColor: '#121212' }} size="large" color="#FFFFE0" />;
    }

    const currentQuestionIndex = gameRoom.gameData?.currentQuestionIndex || 0;
    const currentQuestion = gameRoom.gameData?.questions[currentQuestionIndex] || "Loading question...";

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Who's most likely to?</Text>
            </View>

            <View style={styles.questionContainer}>
                <Text style={styles.questionText}>{currentQuestion}</Text>
            </View>

            <View style={styles.playersGrid}>
                {gameRoom.players.map((player) => (
                    <PlayerVoteCard 
                        key={player.uid}
                        player={player}
                        isSelected={selectedPlayerId === player.uid}
                        onSelect={setSelectedPlayerId}
                    />
                ))}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.voteButton} onPress={handleVote}>
                    <Text style={styles.voteButtonText}>Vote!</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1e1e1e', padding: 15 },
    header: { paddingVertical: 20 },
    headerText: { fontFamily: 'PressStart2P', color: '#888', fontSize: 14, textAlign: 'center' },
    questionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10 },
    questionText: { fontFamily: 'PressStart2P', color: 'white', fontSize: 24, textAlign: 'center', lineHeight: 35 },
    playersGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingVertical: 20 },
    playerCard: { width: '45%', aspectRatio: 1, backgroundColor: '#333', borderRadius: 15, margin: '2.5%', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'transparent' },
    playerCardSelected: { borderColor: '#bfff7b' },
    playerCardName: { fontFamily: 'PressStart2P', color: 'white', fontSize: 16 },
    footer: { paddingBottom: 20 },
    voteButton: { backgroundColor: '#252525', padding: 20, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#444' },
    voteButtonText: { fontFamily: 'PressStart2P', color: 'white', fontSize: 16 },
});

export default MostLikelyToGameScreen;