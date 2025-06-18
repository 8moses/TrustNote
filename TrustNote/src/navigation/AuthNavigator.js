// src/navigation/AuthNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import WelcomeScreen from '../screens/auth/WelcomeScreen';
import SignupScreen from '../screens/auth/SignupScreen';
// --- FIX #1: Import the LoginScreen component ---
import LoginScreen from '../screens/auth/LoginScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />

    {/* --- FIX #2: Add the LoginScreen to the navigator's stack --- */}
    <Stack.Screen name="Login" component={LoginScreen} />
    
  </Stack.Navigator>
);

export default AuthNavigator;