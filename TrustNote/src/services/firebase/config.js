// src/services/firebase/config.js

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// These are the new, important imports
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your specific Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBivlXDqSVqBCqdzq7PwJHYKSIomSsaRA",
  authDomain: "trustnote-4539d.firebaseapp.com",
  projectId: "trustnote-4539d",
  storageBucket: "trustnote-4539d.firebasestorage.app",
  messagingSenderId: "1030760521674",
  appId: "1:1030760521674:web:41a3908ab2bd7c48d13933"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// This is the new, correct way to initialize Auth for React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Firestore initialization remains the same
export const db = getFirestore(app);