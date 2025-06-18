import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { getPendingRequests, acceptFriendRequest, declineFriendRequest } from '../../services/firebase/firestore';

const RequestCard = ({ request, onAccept, onDecline }) => (
  <View style={styles.card}>
    <Image source={{ uri: request.sender.avatar }} style={styles.avatar} />
    <View style={styles.cardBody}>
      <Text style={styles.displayName}>{request.sender.displayName}</Text>
      <Text style={styles.mutualFriendsText}>Sent you a friend request</Text>
    </View>
    <View style={styles.actions}>
      <TouchableOpacity onPress={() => onDecline(request.id)} style={[styles.actionButton, styles.declineButton]}>
        <Ionicons name="close-outline" size={24} color="#ff8a8a" />
      </TouchableOpacity>
      {/* --- FIX #1: Pass the entire 'request' object, not just the id --- */}
      <TouchableOpacity onPress={() => onAccept(request)} style={[styles.actionButton, styles.acceptButton]}>
        <Ionicons name="checkmark-outline" size={24} color="#bfff7b" />
      </TouchableOpacity>
    </View>
  </View>
);

const FriendRequestsScreen = ({ navigation }) => {
  const user = useSelector((state) => state.auth.user);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchRequests = async () => {
        if (!user?.uid) {
            setRequests([]);
            setLoading(false);
            return;
        };
        setLoading(true);
        try {
          const pendingRequests = await getPendingRequests(user.uid);
          setRequests(pendingRequests);
        } catch (error) {
          console.error("Failed to fetch friend requests:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchRequests();
    }, [user])
  );

  // --- FIX #2: The function now receives the full 'request' object ---
  const handleAccept = async (request) => {
    // Pass the full object to our upgraded firestore function
    await acceptFriendRequest(request);
    // Remove the request from the list using its ID
    setRequests(prev => prev.filter(req => req.id !== request.id));
  };

  const handleDecline = async (friendshipId) => {
    await declineFriendRequest(friendshipId);
    setRequests(prev => prev.filter(req => req.id !== friendshipId));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friend Requests</Text>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#FFFFE0" />
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={80} color="#555" />
            <Text style={styles.emptyText}>No pending requests</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RequestCard request={item} onAccept={handleAccept} onDecline={handleDecline} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1c1c1c' },
    headerTitle: { fontFamily: 'PressStart2P', color: 'white', fontSize: 18 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontFamily: 'PressStart2P', color: '#555', fontSize: 14, marginTop: 20 },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c1c', borderRadius: 15, padding: 15, marginBottom: 15, },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    cardBody: { flex: 1, marginLeft: 15 },
    displayName: { fontFamily: 'PressStart2P', color: 'white', fontSize: 14, marginBottom: 4 },
    mutualFriendsText: { color: 'gray', fontSize: 12 },
    actions: { flexDirection: 'row' },
    actionButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
    acceptButton: { backgroundColor: '#4CAF5020' },
    declineButton: { backgroundColor: '#5D2A2A50' },
});

export default FriendRequestsScreen;