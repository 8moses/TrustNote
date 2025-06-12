import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Button from '../common/Button';

const SignupForm = ({ username, setUsername, email, setEmail, password, setPassword, onSubmit }) => (
    <View>
        <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#888"
        />
        <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#888"
        />
        <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#888"
        />
        <Button title="Create Account" onPress={onSubmit} />
    </View>
);

const styles = StyleSheet.create({
    input: {
        backgroundColor: '#333',
        color: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        fontSize: 16,
    },
});

export default SignupForm;