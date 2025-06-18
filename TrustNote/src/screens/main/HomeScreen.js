import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
// --- FIX #1: Import the useFocusEffect hook ---
import { useFocusEffect } from '@react-navigation/native';

import { getPendingFriendRequestCount } from '../../services/firebase/firestore';
import { fetchThoughts } from '../../store/slices/socialSlice';
import StickyNote from '../../components/social/StickyNote';
import Button from '../../components/common/Button';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const profile = useSelector((state) => state.auth.profile);
  const { thoughts, status } = useSelector((state) => state.social);
  
  const [friendRequestCount, setFriendRequestCount] = useState(0);

  // --- FIX #2: Use useFocusEffect to refetch the count whenever the screen is focused ---
  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        getPendingFriendRequestCount(user.uid).then(setFriendRequestCount);
      }
    }, [user])
  );

  // This useEffect can now be dedicated to fetching thoughts
  useEffect(() => {
    if (user?.uid && status === 'idle') {
        dispatch(fetchThoughts(user.uid));
    }
  }, [user, dispatch, status]);

  const onRefresh = useCallback(() => {
    if (user?.uid) {
        dispatch(fetchThoughts(user.uid));
    }
  }, [dispatch, user]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.greeting}>Hey, {profile?.displayName || 'friend'}!</Text>
          <Text style={styles.subGreeting}>Here's what's new.</Text>

          <View style={styles.statusContainer}>
            <TouchableOpacity 
              style={styles.statusCard}
              onPress={() => navigation.navigate('FriendRequests')}
            >
              <Ionicons name="people-circle-outline" size={32} color="#ADD8E6" />
              <Text style={styles.statusNumber}>{friendRequestCount}</Text>
              <Text style={styles.statusText}>Friend Requests</Text>
            </TouchableOpacity>

            <View style={styles.statusCard}>
              <Ionicons name="help-circle-outline" size={32} color="#bfff7b" />
              <Text style={styles.statusNumber}>1</Text>
              <Text style={styles.statusText}>Daily Question</Text>
            </View>
          </View>
          
          <View style={styles.feedSection}>
            <Text style={styles.sectionTitle}>Latest Thoughts</Text>
            {status === 'loading' ? (
              <ActivityIndicator color="#FFFFE0" style={{marginTop: 20}}/>
            ) : (
              <FlatList
                data={thoughts.slice(0, 5)}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <StickyNote note={item} />}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 10 }}
              />
            )}
          </View>

          <View style={styles.ctaContainer}>
              <Button
                title="Play Trust Mode"
                onPress={() => navigation.navigate('Trust Mode')}
                style={styles.ctaButton}
                textStyle={styles.ctaButtonText}
              />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    content: { padding: 20 },
    greeting: { fontFamily: 'PressStart2P', fontSize: 22, color: 'white', },
    subGreeting: { fontFamily: 'PressStart2P', fontSize: 14, color: 'gray', marginTop: 8, marginBottom: 30, },
    statusContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40, },
    statusCard: { backgroundColor: '#1c1c1c', borderRadius: 15, padding: 15, alignItems: 'center', width: '48%', },
    statusNumber: { fontFamily: 'PressStart2P', fontSize: 28, color: 'white', marginVertical: 8, },
    statusText: { fontFamily: 'PressStart2P', fontSize: 10, color: '#888', },
    feedSection: { marginBottom: 40 },
    sectionTitle: { fontFamily: 'PressStart2P', fontSize: 18, color: 'white', marginBottom: 15, },
    ctaContainer: { alignItems: 'center', marginTop: 20 },
    ctaButton: { width: '100%', paddingVertical: 18, borderRadius: 15, backgroundColor: '#252525' },
    ctaButtonText: { fontFamily: 'PressStart2P', fontSize: 16, color: 'white' },
});

export default HomeScreen;