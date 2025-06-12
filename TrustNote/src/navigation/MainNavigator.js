// src/navigation/MainNavigator.js

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import the screens we need for the tabs
import HomeScreen from '../screens/main/HomeScreen';
import TrustModeScreen from '../screens/main/TrustModeScreen';
// NOTE: ThoughtsWallScreen is no longer imported here

const Tab = createBottomTabNavigator();

// Placeholder for screens we haven't built yet
const PlaceholderScreen = ({ route }) => (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212'}}>
        <Text style={{color: 'white', fontSize: 24, fontFamily: 'PressStart2P'}}>{route.name}</Text>
    </View>
);

const MainNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { 
        backgroundColor: '#1c1c1c', 
        borderTopColor: '#333' 
      },
      tabBarActiveTintColor: 'white',
      tabBarInactiveTintColor: 'gray',
      tabBarShowLabel: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        
        if (route.name === 'Profile') {
          iconName = focused ? 'person-circle' : 'person-circle-outline';
        } else if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Trust Mode') {
          iconName = focused ? 'game-controller' : 'game-controller-outline';
        } else if (route.name === 'Settings') {
          iconName = focused ? 'settings' : 'settings-outline';
        }
        
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Profile" component={PlaceholderScreen} />
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Trust Mode" component={TrustModeScreen} />
    <Tab.Screen name="Settings" component={PlaceholderScreen} />
  </Tab.Navigator>
);

export default MainNavigator;