import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import ThoughtsWall from '../../components/social/ThoughtsWall';
import { fetchThoughts } from '../../store/slices/socialSlice';
import Button from '../../components/common/Button';
import { postThoughtToWall } from '../../services/firebase/firestore';

const ThoughtsWallScreen = () => {
    const dispatch = useDispatch();
    const { thoughts, status } = useSelector((state) => state.social);
    const user = useSelector((state) => state.auth.user);
    const profile = useSelector((state) => state.auth.profile);

    const loadThoughts = useCallback(() => {
        if(user){
            dispatch(fetchThoughts(user.uid));
        }
    }, [dispatch, user]);

    useEffect(() => {
        loadThoughts();
    }, [loadThoughts]);

    const handleAddThought = async () => {
        if (!user || !profile) return;
        try {
            // In a real app, this would open a modal/new screen (CreateStickyNoteScreen)
            await postThoughtToWall(user.uid, profile.name, {
                content: 'This is a new test thought!',
                position: { x: 0, y: 0 },
                color: '#FFFFE0',
                visibility: 'friends'
            });
            loadThoughts(); // Refresh the list after posting
        } catch (error) {
            console.error("Failed to post thought:", error);
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Thoughts Wall</Text>
                <Button title="Add Note" onPress={handleAddThought} style={{padding: 10}} textStyle={{fontSize: 14}}/>
            </View>
            <ThoughtsWall
                thoughts={thoughts}
                onRefresh={loadThoughts}
                refreshing={status === 'loading'}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default ThoughtsWallScreen;