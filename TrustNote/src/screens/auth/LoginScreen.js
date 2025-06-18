// src/screens/auth/LoginScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Alert, StyleSheet, Text, SafeAreaView, Dimensions, TextInput, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';

import { signInUser } from '../../services/firebase/auth';
import { getUserProfile } from '../../services/firebase/firestore';
import { setAuthUser, setUserProfile } from '../../store/slices/authSlice';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInUser(email, password);
      const authUser = userCredential.user;

      if (authUser) {
        const userProfile = await getUserProfile(authUser.uid);

        // --- THIS IS THE FIX ---
        // Instead of passing the whole authUser object, we pass a simple object with just the uid.
        dispatch(setAuthUser({ uid: authUser.uid })); 
        // -----------------------
        
        dispatch(setUserProfile(userProfile));
      } else {
        throw new Error("Could not find user data after login.");
      }
    } catch (error) {
      Alert.alert('Login Failed', 'Please check your email and password and try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ... The rest of your JSX remains the same
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation?.navigate('Welcome')}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#666" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#666" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#888" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.loginButton, loading && styles.loginButtonDisabled]} onPress={handleLogin} disabled={loading}>
            <Text style={styles.loginButtonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signupLink} onPress={() => navigation?.navigate('Signup')}>
            <Text style={styles.signupLinkText}>Don't have an account? <Text style={styles.signupLinkHighlight}>Sign Up</Text></Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

// ... Your styles remain the same
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', padding: 20 },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 100, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 20, padding: 10 },
  content: { alignItems: 'center' },
  card: { backgroundColor: '#1e1e1e', borderRadius: 16, padding: 30, width: width * 0.9, maxWidth: 400, borderWidth: 1, borderColor: '#333' },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: '#888', fontSize: 16, textAlign: 'center', marginBottom: 30 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2a2a2a', borderRadius: 12, marginBottom: 16, paddingHorizontal: 15, paddingVertical: 15, borderWidth: 1, borderColor: '#333' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#fff' },
  eyeIcon: { padding: 5 },
  loginButton: { backgroundColor: '#252525', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#444' },
  loginButtonDisabled: { backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  signupLink: { alignItems: 'center' },
  signupLinkText: { fontSize: 14, color: '#888' },
  signupLinkHighlight: { color: '#4CAF50', fontWeight: '600' }
});

export default LoginScreen;