import React, { useState } from 'react';
// --- 1. Add Modal and TextInput to the imports ---
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

// --- 2. Import the new reauthenticateUser function ---
import { deleteCurrentUserAccount, reauthenticateUser } from '../../services/firebase/auth';
import { deleteUserDocument } from '../../services/firebase/firestore';
import { clearAuth } from '../../store/slices/authSlice';


const SettingRow = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <View style={styles.rowLabel}>
      <Ionicons name={icon} size={22} color="#FFFFE0" style={styles.rowIcon} />
      <Text style={styles.rowText}>{text}</Text>
    </View>
    <Ionicons name="chevron-forward-outline" size={22} color="#555" />
  </TouchableOpacity>
);

const ToggleSettingRow = ({ icon, text, value, onValueChange }) => (
  <View style={styles.row}>
    <View style={styles.rowLabel}>
      <Ionicons name={icon} size={22} color="#FFFFE0" style={styles.rowIcon} />
      <Text style={styles.rowText}>{text}</Text>
    </View>
    <Switch
      trackColor={{ false: '#767577', true: '#4CAF50' }}
      thumbColor={value ? '#f4f3f4' : '#f4f3f4'}
      onValueChange={onValueChange}
      value={value}
    />
  </View>
);

const SettingsScreen = ({ navigation }) => {
  const profile = useSelector((state) => state.auth.profile);
  const dispatch = useDispatch();

  // --- 3. Add new state for the modal and password input ---
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [allowFriendRequests, setAllowFriendRequests] = useState(profile?.allowFriendRequests ?? true);
  const [friendRequestNotifs, setFriendRequestNotifs] = useState(profile?.notificationSettings?.friendRequests ?? true);
  const [gameInviteNotifs, setGameInviteNotifs] = useState(profile?.notificationSettings?.gameInvites ?? true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // This function now handles the re-authentication first, then deletion
  const handleReauthenticateAndDelete = async () => {
    if (!password) {
      Alert.alert("Password Required", "Please enter your password.");
      return;
    }

    setIsDeleting(true);
    try {
      // Step 1: Re-authenticate the user
      await reauthenticateUser(password);

      // Step 2: If re-authentication is successful, proceed with deletion
      await deleteUserDocument(profile.uid);
      await deleteCurrentUserAccount();
      
      // Step 3: Clear local state and log out
      dispatch(clearAuth());

    } catch (error) {
      setIsDeleting(false);
      setIsModalVisible(false);
      setPassword('');
      console.error("Account deletion failed:", error);
      Alert.alert("Error", "Deletion failed. Your password may be incorrect, or another error occurred.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* --- 4. Add the Modal component to the screen's JSX --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={styles.modalText}>For your security, please enter your password to permanently delete your account.</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Password"
              placeholderTextColor="#666"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={() => { setIsModalVisible(false); setPassword(''); }}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonDestructive]} 
                onPress={handleReauthenticateAndDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <ActivityIndicator color="white" /> : <Text style={styles.modalButtonText}>Delete</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionCard}>
            <SettingRow icon="person-outline" text="Edit Profile" onPress={() => navigation.navigate('Profile')} />
            <SettingRow icon="shield-checkmark-outline" text="Security" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            <View style={styles.sectionCard}>
                <ToggleSettingRow icon="contrast-outline" text="Dark Mode" value={isDarkMode} onValueChange={setIsDarkMode} />
            </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.sectionCard}>
            <ToggleSettingRow icon="people-outline" text="Allow Friend Requests" value={allowFriendRequests} onValueChange={setAllowFriendRequests} />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionCard}>
            <ToggleSettingRow icon="person-add-outline" text="Friend Requests" value={friendRequestNotifs} onValueChange={setFriendRequestNotifs} />
            <ToggleSettingRow icon="game-controller-outline" text="Game Invites" value={gameInviteNotifs} onValueChange={setGameInviteNotifs} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More</Text>
          <View style={styles.sectionCard}>
            <SettingRow icon="document-text-outline" text="Terms of Service" onPress={() => {}} />
            <SettingRow icon="help-buoy-outline" text="Help & Support" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.dangerZone}>
          {/* --- 5. The Delete Account button now just opens the modal --- */}
          <TouchableOpacity style={styles.deleteButton} onPress={() => setIsModalVisible(true)}>
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scrollContent: { paddingBottom: 40 },
  headerTitle: { fontFamily: 'PressStart2P', color: 'white', fontSize: 24, textAlign: 'center', paddingVertical: 20, paddingHorizontal: 20 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontFamily: 'PressStart2P', color: '#888', fontSize: 12, marginBottom: 10, textTransform: 'uppercase' },
  sectionCard: { backgroundColor: '#1c1c1c', borderRadius: 15, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#2c2c2c', },
  rowIcon: { marginRight: 15, },
  rowText: { fontFamily: 'PressStart2P', color: 'white', fontSize: 14, },
  rowLabel: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10, },
  dangerZone: { marginTop: 30, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: '#2c2c2c', paddingTop: 30 },
  deleteButton: { backgroundColor: '#5D2A2A20', borderRadius: 15, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#8B3A3A' },
  deleteButtonText: { fontFamily: 'PressStart2P', color: '#ff8a8a', fontSize: 14 },
  
  // --- 6. New Styles for the Modal ---
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    borderRadius: 15,
    padding: 25,
    width: '90%',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 16,
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    color: 'white',
    fontSize: 16,
    marginBottom: 25,
    textAlign: 'center',
    fontFamily: 'PressStart2P',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
  },
  modalButtonDestructive: {
    backgroundColor: '#8B3A3A',
    marginLeft: 10,
  },
  modalButtonText: {
    color: 'white',
    fontFamily: 'PressStart2P',
    fontSize: 12,
  }
});

export default SettingsScreen;