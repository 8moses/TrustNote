import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import StickyNote from './StickyNote';

const ThoughtsWall = ({ thoughts, onRefresh, refreshing }) => {
    if (thoughts.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>The wall is empty.</Text>
                <Text style={styles.emptySubText}>Post a thought or add friends to see their notes!</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={thoughts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <StickyNote note={item} />}
            contentContainerStyle={styles.container}
            onRefresh={onRefresh}
            refreshing={refreshing}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: 'white',
        fontSize: 18,
    },
    emptySubText: {
        color: 'gray',
        fontSize: 14,
        marginTop: 8,
    }
});

export default ThoughtsWall;