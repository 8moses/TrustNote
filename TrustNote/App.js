// App.js

import 'react-native-gesture-handler';
import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

// Import the hook to load fonts
import { useFonts } from 'expo-font';

export default function App() {
  // Load the custom font from the correct path
  const [fontsLoaded] = useFonts({
    'PressStart2P': require('./assets/fonts/PressStart2P-Regular.ttf'),
  });

  // Show nothing until fonts are loaded.
  if (!fontsLoaded) {
    return null;
  }

  // Once fonts are loaded, render the rest of the app.
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppNavigator />
        <StatusBar style="light" />
      </NavigationContainer>
    </Provider>
  );
}