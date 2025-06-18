// src/screens/settings/ProfileScreen.js

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { signOutUser } from '../../services/firebase/auth';
import { getUserProfile } from '../../services/firebase/firestore';
import { clearAuth, setUserProfile } from '../../store/slices/authSlice';
import Button from '../../components/common/Button';

const formatDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return 'N/A';
  try {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error("Could not format date string:", dateString, error);
    return 'N/A';
  }
};

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const profile = useSelector((state) => state.auth.profile);

  // This effect refetches the profile every time the screen is viewed
  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        if (user?.uid) {
          const updatedProfile = await getUserProfile(user.uid);
          dispatch(setUserProfile(updatedProfile));
        }
      };
      fetchProfile();
    }, [user, dispatch])
  );

  const handleLogout = async () => {
    try {
      await signOutUser();
      dispatch(clearAuth());
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Image source={{ uri: profile?.avatar || 'https://via.placeholder.com/120' }} style={styles.avatar} />
          <Text style={styles.displayName}>{profile?.displayName || 'User'}</Text>
          <Text style={styles.joinDate}>Member since {formatDate(profile?.createdAt)}</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{profile?.friendsCount || 0}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{profile?.totalThoughts || 0}</Text>
            <Text style={styles.statLabel}>Thoughts</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{profile?.gameStats?.totalGamesPlayed || 0}</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {/* --- This button will now navigate --- */}
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="pencil-outline" size={24} color="#FFFFE0" />
            <Text style={styles.menuItemText}>Edit Profile</Text>
            <Ionicons name="chevron-forward-outline" size={24} color="#555" />
          </TouchableOpacity>
          {/* --- This button will also navigate --- */}
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('FriendsList')}>
            <Ionicons name="people-outline" size={24} color="#FFFFE0" />
            <Text style={styles.menuItemText}>My Friends</Text>
            <Ionicons name="chevron-forward-outline" size={24} color="#555" />
          </TouchableOpacity>
        </View>

        <View style={styles.logoutSection}>
          <Button
            title="Log Out"
            onPress={handleLogout}
            style={styles.logoutButton}
            textStyle={styles.logoutButtonText}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: { alignItems: 'center', paddingVertical: 30, },
    avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#FFFFE0', marginBottom: 15, },
    displayName: { fontFamily: 'PressStart2P', color: 'white', fontSize: 24, marginBottom: 8, },
    joinDate: { fontFamily: 'PressStart2P', color: '#888', fontSize: 12, },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, marginBottom: 40, },
    statBox: { backgroundColor: '#1c1c1c', padding: 20, borderRadius: 15, alignItems: 'center', width: '30%', },
    statNumber: { fontFamily: 'PressStart2P', color: 'white', fontSize: 22, },
    statLabel: { fontFamily: 'PressStart2P', color: '#888', fontSize: 10, marginTop: 5, },
    menuContainer: { marginHorizontal: 20, backgroundColor: '#1c1c1c', borderRadius: 15, overflow: 'hidden' },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#333' },
    menuItemText: { fontFamily: 'PressStart2P', color: 'white', fontSize: 14, marginLeft: 15, flex: 1 },
    logoutSection: { padding: 20, marginTop: 20, },
    logoutButton: { backgroundColor: '#5D2A2A', borderColor: '#8B3A3A', borderWidth: 1, },
    logoutButtonText: { color: 'white', fontFamily: 'PressStart2P', fontSize: 14 }
});

export default ProfileScreen;