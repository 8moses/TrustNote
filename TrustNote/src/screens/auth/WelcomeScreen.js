// src/screens/auth/WelcomeScreen.js

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';
import Button from '../../components/common/Button';

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContent}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        
        <Image
          // This is the corrected path
          source={require('../../../assets/images/trustnote-logo.png')}
          style={styles.logo}
        />
        
        <Button
          title="Begin"
          onPress={() => navigation.navigate('Signup')}
          style={styles.beginButton}
          textStyle={styles.beginButtonText}
        />
      </View>

      <Text style={styles.termsText}>Terms of service</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  welcomeText: {
    fontFamily: 'PressStart2P', // Use the loaded font
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
  logo: {
    width: '80%',
    height: 150, // Adjust height as needed
    resizeMode: 'contain',
    marginBottom: 60,
  },
  beginButton: {
    backgroundColor: '#252525', // Darker button background
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30, // More rounded corners
    borderWidth: 1,
    borderColor: '#444'
  },
  beginButtonText: {
    fontFamily: 'PressStart2P', // Use the loaded font
    color: 'white',
    fontSize: 16,
  },
  termsText: {
    fontFamily: 'PressStart2P', // Use the loaded font
    color: '#666',
    fontSize: 10,
    marginBottom: 20,
  },
});

export default WelcomeScreen;