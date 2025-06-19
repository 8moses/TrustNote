import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getGameInvites, acceptGameInvite } from '../../services/firebase/firestore';

const InviteCard = ({ invite, onAccept }) => (
    <View style={styles.card}>
        <View style={styles.cardBody}>
            <Text style={styles.displayName}>{invite.senderName}</Text>
            <Text style={styles.subText}>invited you to play Most Likely To</Text>
        </View>
        <TouchableOpacity style={styles.acceptButton} onPress={() => onAccept(invite)}>
            <Text style={styles.acceptButtonText}>Join</Text>
        </TouchableOpacity>
    </View>
);

const GameInvitesScreen = ({ navigation }) => {
    const currentUserProfile = useSelector(state => state.auth.profile);
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const fetchInvites = async () => {
                if (!currentUserProfile?.uid) return;
                setLoading(true);
                const gameInvites = await getGameInvites(currentUserProfile.uid);
                setInvites(gameInvites);
                setLoading(false);
            };
            fetchInvites();
        }, [currentUserProfile])
    );

    const handleAccept = async (invite) => {
        await acceptGameInvite(invite.id, currentUserProfile, invite.roomId);
        // Navigate to the lobby after accepting
        navigation.navigate('GameLobby', { roomId: invite.roomId });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={26} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Game Invites</Text>
                <View style={{ width: 26 }} />
            </View>

            {loading ? <ActivityIndicator style={{flex: 1}}/> : (
                <FlatList
                    data={invites}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <InviteCard invite={item} onAccept={handleAccept} />}
                    contentContainerStyle={{ padding: 20 }}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No pending game invites.</Text>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1c1c1c' },
    headerTitle: { fontFamily: 'PressStart2P', color: 'white', fontSize: 18 },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c1c', padding: 20, borderRadius: 10, marginBottom: 10, },
    cardBody: { flex: 1 },
    displayName: { fontFamily: 'PressStart2P', color: 'white', fontSize: 14, marginBottom: 5 },
    subText: { color: 'gray', fontSize: 12 },
    acceptButton: { backgroundColor: '#4CAF50', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
    acceptButtonText: { color: 'white', fontWeight: 'bold' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontFamily: 'PressStart2P', color: '#555', fontSize: 12, },
});

export default GameInvitesScreen;