import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { getFriendsList } from '../../services/firebase/firestore';

// --- FIX #1: The FriendCard now accepts an 'onPress' prop and is a TouchableOpacity ---
const FriendCard = ({ friend, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <Image source={{ uri: friend.avatar }} style={styles.avatar} />
        <Text style={styles.displayName}>{friend.displayName}</Text>
        <Ionicons name="chevron-forward-outline" size={22} color="#555" style={styles.chevron} />
    </TouchableOpacity>
);

const FriendsListScreen = ({ navigation }) => {
    const user = useSelector(state => state.auth.user);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const fetchFriends = async () => {
                if (!user?.uid) return;
                setLoading(true);
                const friendsList = await getFriendsList(user.uid);
                setFriends(friendsList);
                setLoading(false);
            };
            fetchFriends();
        }, [user])
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={26} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Friends</Text>
                <View style={{ width: 26 }} />
            </View>

            {loading ? <ActivityIndicator color="#FFFFE0" style={{flex: 1}}/> : (
                <FlatList
                    data={friends}
                    keyExtractor={item => item.id}
                    // --- FIX #2: We now pass the onPress function to each card ---
                    renderItem={({ item }) => (
                        <FriendCard 
                            friend={item} 
                            // This tells it to navigate to a 'UserProfile' screen and pass the friend's ID
                            onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
                        />
                    )}
                    contentContainerStyle={{padding: 20}}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-circle-outline" size={80} color="#555" />
                            <Text style={styles.emptyText}>You haven't added any friends yet.</Text>
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
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c1c', padding: 15, borderRadius: 10, marginBottom: 10, },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 15, },
    displayName: { fontFamily: 'PressStart2P', color: 'white', fontSize: 14, flex: 1 },
    chevron: { marginLeft: 'auto' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 },
    emptyText: { fontFamily: 'PressStart2P', color: '#555', fontSize: 12, marginTop: 20 },
});

export default FriendsListScreen;