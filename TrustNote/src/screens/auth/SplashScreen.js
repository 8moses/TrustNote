// src/screens/auth/SplashScreen.js

import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FFFFE0" />
      <Text style={styles.text}>Loading TrustNote...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  text: {
    marginTop: 20,
    color: '#FFFFFF',
    fontSize: 16,
    // Make sure you have this font configured in your project
    fontFamily: 'PressStart2P' 
  }
});

export default SplashScreen;