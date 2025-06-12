import React, { useState } from 'react';
import { View, Alert, StyleSheet, Text, SafeAreaView } from 'react-native';
import SignupForm from '../../components/auth/SignupForm';
import { signUpUser } from '../../services/firebase/auth';
import { createUserProfile, isUsernameTaken } from '../../services/firebase/firestore';

const SignupScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !username) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    setLoading(true);
    try {
      const taken = await isUsernameTaken(username.toLowerCase());
      if (taken) {
        throw new Error('This username is already taken.');
      }
      const userCredential = await signUpUser(email, password);
      await createUserProfile(userCredential.user.uid, email, username.toLowerCase());
      // Auth state listener in useAuth hook will handle the rest
    } catch (error) {
      Alert.alert('Sign Up Failed', error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Your Account</Text>
        <SignupForm
            username={username}
            setUsername={setUsername}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onSubmit={handleSignUp}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { flex: 1, justifyContent: 'center', padding: 20 },
  title: {
      color: 'white',
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 30,
  }
});

export default SignupScreen;