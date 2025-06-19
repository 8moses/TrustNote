import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useSelector } from 'react-redux'; // 1. Import useSelector to get user data
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import { createGameRoom } from '../../services/firebase/firestore'; // 2. Import the new function

const TrustModeScreen = ({ navigation }) => {
  // 3. Get the current user's profile from the Redux store
  const currentUserProfile = useSelector((state) => state.auth.profile);

  const handleAddFriend = () => {
    navigation.navigate('AddFriend');
  };

  const handleOpenMenu = () => {
    navigation.navigate('Settings');
  };

  // 4. Create a new handler function for the "Most Likely To" button
  const handleStartMostLikelyTo = async () => {
    if (!currentUserProfile) {
      Alert.alert("Error", "Could not find your profile to start a game.");
      return;
    }
    try {
      // Create a new game room in Firestore and get its ID
      const newRoomId = await createGameRoom(currentUserProfile);
      if (newRoomId) {
        // Navigate to the lobby, passing the new room's ID as a parameter
        navigation.navigate('GameLobby', { roomId: newRoomId });
      }
    } catch (error) {
        Alert.alert("Error", "Could not create a game room.");
        console.error("Error creating game room:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header onLeftPress={handleAddFriend} onRightPress={handleOpenMenu} />
      
      <View style={styles.content}>
        <Text style={styles.title}>Trust Mode</Text>

        <View style={styles.buttonContainer}>
          <Button
            title="Trust Notes"
            style={styles.modeButton}
            textStyle={styles.modeButtonText}
            onPress={() => console.log('Go to Trust Notes')}
          />
          <Button
            title="Most likely to"
            style={styles.modeButton}
            textStyle={styles.modeButtonText}
            // 5. Connect the button's onPress to our new handler
            onPress={handleStartMostLikelyTo}
          />
          <Button
            title="Truth or Dare"
            style={styles.modeButton}
            textStyle={styles.modeButtonText}
            onPress={() => console.log('Go to Truth or Dare')}
          />
        </View>
      </View>

      <Text style={styles.termsText}>Terms of service</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontFamily: 'PressStart2P',
    color: 'white',
    fontSize: 18,
    marginBottom: 40,
  },
  buttonContainer: {
    width: '80%',
  },
  modeButton: {
    backgroundColor: '#252525',
    borderWidth: 1,
    borderColor: '#444',
    marginBottom: 20,
    borderRadius: 15,
  },
  modeButtonText: {
    fontFamily: 'PressStart2P',
    color: 'white',
    fontSize: 14,
  },
  termsText: {
    fontFamily: 'PressStart2P',
    color: '#666',
    fontSize: 10,
    paddingBottom: 10,
  },
});

export default TrustModeScreen;