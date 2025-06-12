// src/screens/main/TrustModeScreen.js

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';

// This is the screen component for the "Trust Mode" tab
const TrustModeScreen = ({ navigation }) => {
  // These functions will handle what happens when you press the header icons
  const handleAddFriend = () => {
    console.log('Navigate to Add Friend screen');
    // Example: navigation.navigate('AddFriendScreen');
  };

  const handleOpenMenu = () => {
    console.log('Open settings menu');
    // Example: navigation.navigate('Settings');
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
            onPress={() => console.log('Go to Most Likely To')}
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