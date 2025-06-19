import React, { useState, useEffect, useRef } from 'react';
import { View, Alert, StyleSheet, Text, SafeAreaView, Dimensions, TextInput, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';

import { signUpUser } from '../../services/firebase/auth';
import { createUserProfile, isUsernameTaken, getUserProfile } from '../../services/firebase/firestore';
import { setAuthUser, setUserProfile } from '../../store/slices/authSlice';

const { width } = Dimensions.get('window');

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // --- THIS IS THE NEW FIX ---
  // 1. Add state to control when autocomplete is ready.
  const [isReadyForAutocomplete, setIsReadyForAutocomplete] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    // 2. After a short delay, we'll allow autocomplete to be enabled.
    const timer = setTimeout(() => {
      setIsReadyForAutocomplete(true);
    }, 500); // 500ms delay gives the screen time to settle.

    return () => clearTimeout(timer); // Clean up on unmount
  }, []);

  const handleSignUp = async () => {
    if (!email || !password || !verifyPassword || !username) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    if (password !== verifyPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (!acceptTerms) {
      Alert.alert('Error', 'Please accept the Terms of Service.');
      return;
    }

    setLoading(true);
    try {
      const taken = await isUsernameTaken(username.toLowerCase());
      if (taken) {
        throw new Error('This username is already taken.');
      }
      
      const userCredential = await signUpUser(email, password);
      const authUser = userCredential.user;

      await createUserProfile(authUser.uid, email, username.toLowerCase());
      const newUserProfile = await getUserProfile(authUser.uid);
      
      dispatch(setAuthUser({ uid: authUser.uid }));
      dispatch(setUserProfile(newUserProfile));

    } catch (error) {
      Alert.alert('Sign Up Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation?.navigate('Welcome')}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.card}>
            {/* The hiddenInput has been removed as it's not needed for this method */}
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us today</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#666" value={username} onChangeText={setUsername} autoCapitalize="none"/>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#666" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"/>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Password" 
                placeholderTextColor="#666" 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry={!showPassword}
                // --- 3. The autoComplete prop is now conditional ---
                autoComplete={isReadyForAutocomplete ? 'new-password' : 'off'}
                textContentType="newPassword"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#888" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Verify Password" placeholderTextColor="#666" value={verifyPassword} onChangeText={setVerifyPassword} secureTextEntry={!showVerifyPassword}/>
              <TouchableOpacity onPress={() => setShowVerifyPassword(!showVerifyPassword)} style={styles.eyeIcon}>
                <Ionicons name={showVerifyPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#888" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.termsContainer} onPress={() => setAcceptTerms(!acceptTerms)}>
              <View style={[styles.checkbox, acceptTerms && styles.checkboxActive]}>
                {acceptTerms && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.termsText}>I accept the <Text style={styles.termsLink}>Terms of Service</Text></Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.createButton, loading && styles.createButtonDisabled]} onPress={handleSignUp} disabled={loading}>
              <Text style={styles.createButtonText}>{loading ? 'Creating...' : 'Create Account'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.loginLink} onPress={() => navigation?.navigate('Login')}>
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginLinkHighlight}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 100, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 20, padding: 10 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  content: { alignItems: 'center' },
  card: { backgroundColor: '#1e1e1e', borderRadius: 16, padding: 30, width: width * 0.9, maxWidth: 400, borderWidth: 1, borderColor: '#333' },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: '#888', fontSize: 16, textAlign: 'center', marginBottom: 30 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2a2a2a', borderRadius: 12, marginBottom: 16, paddingHorizontal: 15, paddingVertical: 15, borderWidth: 1, borderColor: '#333' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#fff' },
  eyeIcon: { padding: 5 },
  termsContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingHorizontal: 5 },
  checkbox: { width: 18, height: 18, borderRadius: 3, borderWidth: 2, borderColor: '#555', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  termsText: { flex: 1, fontSize: 14, color: '#888', lineHeight: 20 },
  termsLink: { color: '#4CAF50', fontWeight: '600' },
  createButton: { backgroundColor: '#252525', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 32, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#444' },
  createButtonDisabled: { backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loginLink: { alignItems: 'center' },
  loginLinkText: { fontSize: 14, color: '#888' },
  loginLinkHighlight: { color: '#4CAF50', fontWeight: '600' },
  // The hiddenInput style is no longer needed
});

export default SignupScreen;