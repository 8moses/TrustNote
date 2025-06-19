import React, { useState } from 'react';
// --- 1. Add ActivityIndicator to the imports ---
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

// --- 2. Import the isUsernameTaken function ---
import { updateUserProfile, isUsernameTaken } from '../../services/firebase/firestore';
import { setUserProfile } from '../../store/slices/authSlice';

const EditProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.auth.profile);
  
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  // --- 3. Add a loading state ---
  const [loading, setLoading] = useState(false);

  // --- 4. This is the new, more robust save function ---
  const handleSave = async () => {
    const newDisplayName = displayName.trim().toLowerCase();
    const currentDisplayName = profile?.displayName;

    if (newDisplayName.length < 3) {
      Alert.alert("Invalid Name", "Display name must be at least 3 characters.");
      return;
    }

    setLoading(true);
    try {
      // Only check for uniqueness if the name has actually changed
      if (newDisplayName !== currentDisplayName) {
        const taken = await isUsernameTaken(newDisplayName);
        if (taken) {
          Alert.alert("Username Taken", "This username is already in use. Please choose another.");
          setLoading(false); // Stop loading
          return; // Stop the save process
        }
      }

      // If checks pass, proceed with saving
      const updatedData = { displayName: newDisplayName };
      await updateUserProfile(profile.uid, updatedData);
      
      const updatedProfile = { ...profile, ...updatedData };
      dispatch(setUserProfile(updatedProfile));
      
      Alert.alert("Success", "Your profile has been updated.");
      navigation.goBack();

    } catch (error) {
      Alert.alert("Error", "Could not update profile.");
      console.error(error);
    } finally {
      setLoading(false); // Ensure loading is stopped even if there's an error
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
            autoCapitalize="none"
        />
        {/* --- 5. The save button now shows a loading indicator --- */}
        <TouchableOpacity 
            style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
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
  saveButton: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 10, alignItems: 'center', minHeight: 58 },
  saveButtonDisabled: { backgroundColor: '#2d6a30' },
  saveButtonText: { fontFamily: 'PressStart2P', color: 'white', fontSize: 14 },
});

export default EditProfileScreen;