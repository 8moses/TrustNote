// src/screens/social/ThoughtsWallScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  ActivityIndicator, 
  ImageBackground,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { fetchThoughts } from '../../store/slices/socialSlice';
import { postThoughtToWall } from '../../services/firebase/firestore';
import Header from '../common/Header';
import StickyNote from './StickyNote'; // <-- Import our new component
import Button from '../common/Button';

const ThoughtsWallScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const profile = useSelector((state) => state.auth.profile);
  const { thoughts, status } = useSelector((state) => state.social);
  
  const [newThought, setNewThought] = useState('');

  const loadThoughts = useCallback(() => {
    if(user?.uid) {
      dispatch(fetchThoughts(user.uid));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if(user?.uid) {
      loadThoughts();
    }
  }, [user, loadThoughts]);

  const handlePostThought = async () => {
    if (!newThought.trim()) {
      Alert.alert("Empty Note", "Please write a thought before posting.");
      return;
    }
    if (!user || !profile) {
      Alert.alert("Error", "You must be logged in to post.");
      return;
    }

    try {
      // Pass all necessary info to the service function
      await postThoughtToWall(user.uid, profile.displayName, profile.avatar, newThought);
      setNewThought(''); // Clear the input
      loadThoughts(); // Refresh the feed
    } catch (error) {
      console.error("Failed to post thought:", error);
      Alert.alert("Error", "Could not post your thought.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <Text style={styles.title}>Thoughts of the day...</Text>
      
      <ImageBackground 
        source={require('../../../assets/images/brick-wall.png')} 
        style={styles.wall}
        imageStyle={{resizeMode: 'repeat'}} // Use 'repeat' for texture
      >
        {status === 'loading' && thoughts.length === 0 ? (
          <ActivityIndicator color="#FFFFE0" size="large" />
        ) : (
          <FlatList
            data={thoughts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <StickyNote note={item} />}
            onRefresh={loadThoughts}
            refreshing={status === 'loading'}
            contentContainerStyle={styles.wallContent}
          />
        )}
      </ImageBackground>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Write your thoughts here!"
            placeholderTextColor="#6B4F4F"
            multiline
            value={newThought}
            onChangeText={setNewThought}
          />
          <Button
            title="Post"
            onPress={handlePostThought}
            style={styles.postButton}
            textStyle={styles.postButtonText}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  title: {
    fontFamily: 'PressStart2P',
    color: 'white',
    fontSize: 16,
    paddingHorizontal: 15,
    paddingBottom: 10,
    alignSelf: 'flex-start',
  },
  wall: {
    flex: 1, 
    justifyContent: 'center',
  },
  wallContent: {
    padding: 10,
  },
  inputContainer: {
    backgroundColor: '#FFFFE0', 
    padding: 15,
    paddingBottom: 20,
    borderTopWidth: 2,
    borderColor: '#333'
  },
  textInput: {
    fontFamily: 'PressStart2P',
    minHeight: 80,
    fontSize: 14,
    color: '#3D2B1F',
    textAlignVertical: 'top',
  },
  postButton: {
    backgroundColor: '#FAD5A5', // A slightly different yellow
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 8,
  },
  postButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 14,
    color: '#3D2B1F'
  }
});

export default ThoughtsWallScreen;