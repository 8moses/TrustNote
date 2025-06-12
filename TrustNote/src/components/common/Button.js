import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Button = ({ title, onPress, style, textStyle }) => (
  <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
    <Text style={[styles.text, textStyle]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: { backgroundColor: '#FFFFE0', padding: 15, borderRadius: 8, alignItems: 'center' },
  text: { color: 'black', fontSize: 16, fontWeight: 'bold' },
});

export default Button;