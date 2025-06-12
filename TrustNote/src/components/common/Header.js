// src/components/common/Header.js

import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // We'll use Ionicons

const Header = ({ onLeftPress, onRightPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
        <Ionicons name="person-add-outline" size={24} color="white" />
      </TouchableOpacity>
      
      <Image
        source={require('../../../assets/images/trustnote-logo.png')}
        style={styles.logo}
      />
      
      <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
        <Ionicons name="menu" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
    width: '100%',
    height: 60,
  },
  logo: {
    width: 150,
    height: 40,
    resizeMode: 'contain',
  },
  iconButton: {
    padding: 5,
  },
});

export default Header;