import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { getUserProfile, unfriendUser } from '../../services/firebase/firestore';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString('en-US', options);
  } catch { return 'N/A'; }
};

const UserProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const currentUser = useSelector((state) => state.auth.user);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const userProfile = await getUserProfile(userId);
      setProfile(userProfile);
      setLoading(false);
    };
    fetchProfile();
  }, [userId]);

  const handleUnfriend = () => {
    Alert.alert(
      `Remove ${profile.displayName}?`,
      "Are you sure you want to remove this friend?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Unfriend", style: "destructive", onPress: async () => {
            await unfriendUser(currentUser.uid, profile.id);
            navigation.goBack();
          } 
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{flex: 1}} color="#FFFFE0" />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
          <Text style={styles.errorText}>User not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.headerNav}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={26} color="white" />
            </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          <Text style={styles.displayName}>{profile.displayName}</Text>
          <Text style={styles.joinDate}>Member since {formatDate(profile.createdAt)}</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statBox}><Text style={styles.statNumber}>{profile.friendsCount || 0}</Text><Text style={styles.statLabel}>Friends</Text></View>
          <View style={styles.statBox}><Text style={styles.statNumber}>{profile.totalThoughts || 0}</Text><Text style={styles.statLabel}>Thoughts</Text></View>
          <View style={styles.statBox}><Text style={styles.statNumber}>{profile.gameStats?.totalGamesPlayed || 0}</Text><Text style={styles.statLabel}>Games Played</Text></View>
        </View>

        <View style={styles.buttonSection}>
            <TouchableOpacity style={styles.unfriendButton} onPress={handleUnfriend}>
                <Ionicons name="person-remove-outline" size={16} color="#ff8a8a" />
                <Text style={styles.unfriendButtonText}>Unfriend</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    headerNav: { position: 'absolute', top: 50, left: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.2)', padding: 5, borderRadius: 20 },
    header: { alignItems: 'center', paddingVertical: 30, paddingTop: 80 },
    avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#FFFFE0', marginBottom: 15, },
    displayName: { fontFamily: 'PressStart2P', color: 'white', fontSize: 24, marginBottom: 8, },
    joinDate: { fontFamily: 'PressStart2P', color: '#888', fontSize: 12, },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, marginBottom: 40, },
    statBox: { backgroundColor: '#1c1c1c', padding: 20, borderRadius: 15, alignItems: 'center', width: '30%', },
    statNumber: { fontFamily: 'PressStart2P', color: 'white', fontSize: 22, },
    statLabel: { fontFamily: 'PressStart2P', color: '#888', fontSize: 10, marginTop: 5, },
    buttonSection: { paddingHorizontal: 20, marginTop: 20 },
    unfriendButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#5D2A2A20', borderRadius: 15, padding: 18, borderWidth: 1, borderColor: '#8B3A3A' },
    unfriendButtonText: { fontFamily: 'PressStart2P', color: '#ff8a8a', fontSize: 14, marginLeft: 10, },
    errorText: { fontFamily: 'PressStart2P', color: '#888', textAlign: 'center', flex: 1, }
});

export default UserProfileScreen;