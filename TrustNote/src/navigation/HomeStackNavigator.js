// src/navigation/HomeStackNavigator.js

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import MainNavigator from './MainNavigator';
import FriendRequestsScreen from '../screens/social/FriendRequestsScreen';
import AddFriendScreen from '../screens/social/AddFriendScreen';
import EditProfileScreen from '../screens/settings/EditProfileScreen';
import FriendsListScreen from '../screens/social/FriendsListScreen';

// --- 1. Import the new UserProfileScreen ---
import UserProfileScreen from '../screens/social/UserProfileScreen';

const Stack = createStackNavigator();

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainNavigator} />
      <Stack.Screen name="FriendRequests" component={FriendRequestsScreen} />
      <Stack.Screen name="AddFriend" component={AddFriendScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="FriendsList" component={FriendsListScreen} />

      {/* --- 2. Add the new screen to the navigator's list --- */}
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />

    </Stack.Navigator>
  );
};

export default HomeStackNavigator;