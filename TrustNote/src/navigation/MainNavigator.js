// src/navigation/MainNavigator.js

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import our new screen
import TrustModeScreen from '../screens/main/TrustModeScreen';

const Tab = createBottomTabNavigator();

// Placeholder screens for other tabs
const PlaceholderScreen = ({ route }) => (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212'}}>
        <Text style={{color: 'white', fontSize: 24}}>{route.name}</Text>
    </View>
);

const MainNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: '#1c1c1c', borderTopColor: '#333' },
      tabBarActiveTintColor: 'white',
      tabBarInactiveTintColor: 'gray',
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        
        if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        } else if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Settings') {
          iconName = focused ? 'settings' : 'settings-outline';
        } else if (route.name === 'Trust Mode') {
          iconName = focused ? 'game-controller' : 'game-controller-outline';
        }
        
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarShowLabel: false,
    })}
  >
    <Tab.Screen name="Profile" component={PlaceholderScreen} />
    <Tab.Screen name="Home" component={PlaceholderScreen} />
    <Tab.Screen name="Trust Mode" component={TrustModeScreen} />
    <Tab.Screen name="Settings" component={PlaceholderScreen} />
  </Tab.Navigator>
);

export default MainNavigator;