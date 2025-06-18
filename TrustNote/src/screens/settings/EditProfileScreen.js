import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { updateUserProfile } from '../../services/firebase/firestore';
import { setUserProfile } from '../../store/slices/authSlice';

const EditProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.auth.profile);
  const [displayName, setDisplayName] = useState(profile?.displayName || '');

  const handleSave = async () => {
    if (displayName.trim().length < 3) {
      Alert.alert("Invalid Name", "Display name must be at least 3 characters.");
      return;
    }
    try {
      const updatedData = { displayName: displayName.trim().toLowerCase() };
      await updateUserProfile(profile.uid, updatedData);
      
      // Update the Redux store locally for an instant UI update
      const updatedProfile = { ...profile, ...updatedData };
      dispatch(setUserProfile(updatedProfile));
      
      Alert.alert("Success", "Your profile has been updated.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Could not update profile.");
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Display Name</Text>
        <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter new display name"
            placeholderTextColor="#666"
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1c1c1c' },
  headerTitle: { fontFamily: 'PressStart2P', color: 'white', fontSize: 18 },
  content: { padding: 20 },
  label: { fontFamily: 'PressStart2P', color: '#888', fontSize: 12, marginBottom: 10, },
  input: { backgroundColor: '#1c1c1c', color: 'white', padding: 15, borderRadius: 10, fontSize: 14, fontFamily: 'PressStart2P', marginBottom: 20 },
  saveButton: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 10, alignItems: 'center' },
  saveButtonText: { fontFamily: 'PressStart2P', color: 'white', fontSize: 14 },
});

export default EditProfileScreen;