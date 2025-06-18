// src/navigation/MainNavigator.js

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import all our real screens
import HomeScreen from '../screens/main/HomeScreen';
import TrustModeScreen from '../screens/main/TrustModeScreen';
import ProfileScreen from '../screens/settings/ProfileScreen';
// --- 1. Import the new SettingsScreen ---
import SettingsScreen from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator();

// PlaceholderScreen is no longer needed.

const MainNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: '#1c1c1c', borderTopColor: '#333' },
      tabBarActiveTintColor: 'white',
      tabBarInactiveTintColor: 'gray',
      tabBarShowLabel: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        
        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Trust Mode') {
          iconName = focused ? 'game-controller' : 'game-controller-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person-circle' : 'person-circle-outline';
        } else if (route.name === 'Settings') {
          iconName = focused ? 'settings' : 'settings-outline';
        }
        
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    {/* The order of your tabs */}
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Trust Mode" component={TrustModeScreen} />

    {/* --- 2. Use the real SettingsScreen component for the 'Settings' tab --- */}
    <Tab.Screen name="Settings" component={SettingsScreen} />
    
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default MainNavigator;