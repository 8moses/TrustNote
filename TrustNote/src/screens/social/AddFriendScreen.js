import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity, Image, TextInput } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { searchUsersByDisplayName, sendFriendRequest, getFriendshipStatus } from '../../services/firebase/firestore';

// This is the new, "smart" button component
const AddFriendButton = ({ recipientId }) => {
    const currentUser = useSelector((state) => state.auth.user);
    // State can be: 'loading', 'add', 'pending', 'friends', 'accept'
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        const checkStatus = async () => {
            const currentStatus = await getFriendshipStatus(currentUser.uid, recipientId);
            if (currentStatus === 'accepted') {
                setStatus('friends');
            } else if (currentStatus === 'requested') {
                setStatus('pending');
            } else if (currentStatus === 'pending_approval') {
                setStatus('accept'); // The other user sent US a request
            } else {
                setStatus('add');
            }
        };
        checkStatus();
    }, [currentUser.uid, recipientId]);

    const handleAddPress = async () => {
        setStatus('pending'); // Optimistically update UI
        await sendFriendRequest(currentUser.uid, recipientId);
    };

    if (status === 'loading') {
        return <ActivityIndicator size="small" color="#555" />;
    }
    if (status === 'friends') {
        return (
            <View style={[styles.addButton, styles.friendsButton]}>
                <Ionicons name="checkmark-circle-outline" size={16} color="white" />
                <Text style={styles.addButtonText}>Friends</Text>
            </View>
        );
    }
    if (status === 'pending') {
        return (
            <View style={[styles.addButton, styles.addButtonDisabled]}>
                <Text style={styles.addButtonText}>Pending</Text>
            </View>
        );
    }
    if (status === 'accept') {
        return (
             <TouchableOpacity style={[styles.addButton, styles.acceptButton]}>
                <Text style={styles.addButtonText}>Accept</Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity onPress={handleAddPress} style={styles.addButton}>
            <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
    );
};


const UserCard = ({ user }) => (
    <View style={styles.card}>
      <Image source={{ uri: user.avatar }} style={styles.avatar} />
      <View style={styles.cardBody}>
        <Text style={styles.displayName}>{user.displayName}</Text>
      </View>
      {/* We now render our smart button here */}
      <AddFriendButton recipientId={user.id} />
    </View>
);

const AddFriendScreen = ({ navigation }) => {
  const currentUser = useSelector((state) => state.auth.user);
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchText.trim().length > 2) {
        setLoading(true);
        const users = await searchUsersByDisplayName(searchText, currentUser.uid);
        setResults(users);
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText, currentUser.uid]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Friends</Text>
        <View style={{ width: 26 }} />
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
            style={styles.searchInput}
            placeholder="Search by username..."
            placeholderTextColor="#666"
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
        />
      </View>
      
      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#FFFFE0" />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <UserCard user={item} />}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Search for users to add them as friends.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 10, paddingBottom: 10 },
    headerTitle: { fontFamily: 'PressStart2P', color: 'white', fontSize: 18 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c1c', borderRadius: 12, marginHorizontal: 20, marginBottom: 10, paddingHorizontal: 15, },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, height: 50, color: 'white', fontSize: 16, fontFamily: 'PressStart2P' },
    emptyContainer: { alignItems: 'center', marginTop: 50, paddingHorizontal: 20 },
    emptyText: { fontFamily: 'PressStart2P', color: '#555', fontSize: 12, textAlign: 'center' },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c1c', borderRadius: 15, padding: 15, marginBottom: 15 },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    cardBody: { flex: 1, marginLeft: 15 },
    displayName: { fontFamily: 'PressStart2P', color: 'white', fontSize: 14 },
    // Button Styles
    addButton: { backgroundColor: '#4CAF50', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center' },
    addButtonDisabled: { backgroundColor: '#555' },
    friendsButton: { backgroundColor: '#252525', borderWidth: 1, borderColor: '#444' },
    acceptButton: { backgroundColor: '#3b5998' },
    addButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 5 },
});

export default AddFriendScreen;