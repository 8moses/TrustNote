import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StickyNote = ({ note }) => (
  <View style={[styles.note, { backgroundColor: note.color || '#FFFFE0' }]}>
    <Text style={styles.content}>{note.content}</Text>
    <Text style={styles.author}>- {note.authorUsername}</Text>
  </View>
);

const styles = StyleSheet.create({
  note: {
    padding: 15,
    borderRadius: 5,
    margin: 8,
    minWidth: 150,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  content: {
    fontSize: 16,
    color: '#333',
  },
  author: {
    fontSize: 12,
    color: '#555',
    textAlign: 'right',
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default StickyNote;