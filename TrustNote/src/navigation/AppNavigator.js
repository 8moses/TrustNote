import React from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../hooks/useAuth';

// --- The necessary imports for our final structure ---
import AuthNavigator from './AuthNavigator';
import HomeStackNavigator from './HomeStackNavigator'; // Use the stack navigator
import SplashScreen from '../screens/auth/SplashScreen'; // Use the splash screen component

// We no longer need to import MainNavigator or View/ActivityIndicator here
// import MainNavigator from './MainNavigator';
// import { View, ActivityIndicator } from 'react-native';

const AppNavigator = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { loading } = useAuth(); // Custom hook handles the auth state logic

  // While the useAuth hook is checking for a user, show the splash screen
  if (loading) {
    return <SplashScreen />;
  }

  // Once loading is complete, render the correct navigator.
  // This now renders HomeStackNavigator for authenticated users.
  return isAuthenticated ? <HomeStackNavigator /> : <AuthNavigator />;
};

export default AppNavigator;