// src/services/firebase/firestore.js

import { doc, setDoc, getDoc, serverTimestamp, addDoc, collection, query, where, getDocs, orderBy, getCountFromServer } from 'firebase/firestore';
import { db } from './config';

/**
 * Creates a user document after signup, matching the new "flat" structure.
 */
export const createUserProfile = (uid, email, username) => {
  const userDocRef = doc(db, 'users', uid);
  // NOTE: The 'profile' object is gone. We now set top-level fields.
  return setDoc(userDocRef, {
    uid: uid,
    email: email,
    displayName: username,
    avatar: `https://api.dicebear.com/8.x/pixel-art/png?seed=${username}`,
    createdAt: serverTimestamp(),
    lastActive: serverTimestamp(),
    isProfilePublic: true,
    allowFriendRequests: true,
    shareThoughtsPublicly: true,
    theme: 'dark',
    defaultNoteColor: '#FFFFE0',
    friendsCount: 0,
    totalThoughts: 0,
    publicThoughts: 0,
    notificationSettings: {
      friendRequests: true,
      gameInvites: true,
      thoughtsWallActivity: true,
    },
    gameStats: {
      totalGamesPlayed: 0,
      totalScore: 0,
      highestScore: 0,
      achievements: [],
      favoriteGameMode: null,
    }
  });
};

export const getUserProfile = (uid) => {
  const userDocRef = doc(db, 'users', uid);
  return getDoc(userDocRef);
};

// This function is no longer needed as the user document now contains the username directly
// We will keep it for now but you may delete it later.
export const isUsernameTaken = async (username) => {
  const q = query(collection(db, 'users'), where("displayName", "==", username));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

/**
 * Posts a thought to the wall. This function already matches the new structure.
 */
export const postThoughtToWall = (userId, username, avatar, content) => {
  const thoughtsCollectionRef = collection(db, 'thoughtsWall');
  return addDoc(thoughtsCollectionRef, {
    authorId: userId,
    authorName: username,
    authorAvatar: avatar,
    content: content,
    contentType: 'text',
    color: ['#FFFFE0', '#ADD8E6', '#90EE90', '#ffb6c1'][Math.floor(Math.random() * 4)],
    visibility: 'friends',
    allowComments: true,
    likes: 0,
    likedBy: [],
    comments: 0,
    createdAt: serverTimestamp(),
    position: { x: Math.random(), y: Math.random(), rotation: (Math.random() - 0.5) * 10 },
  });
};

/**
 * Gets the thoughts feed. This now needs to first find your friends from the 'friendships' collection.
 */
export const getThoughtsFeedForUser = async (userId) => {
    if (!userId) return [];

    // Step 1: Find all accepted friendships involving the current user
    const friendsQuery1 = query(collection(db, 'friendships'), where('userId1', '==', userId), where('status', '==', 'accepted'));
    const friendsQuery2 = query(collection(db, 'friendships'), where('userId2', '==', userId), where('status', '==', 'accepted'));

    const [query1Snapshot, query2Snapshot] = await Promise.all([getDocs(friendsQuery1), getDocs(friendsQuery2)]);
    
    const friendIds = new Set();
    query1Snapshot.forEach(doc => friendIds.add(doc.data().userId2));
    query2Snapshot.forEach(doc => friendIds.add(doc.data().userId1));

    const readableAuthors = [userId, ...Array.from(friendIds)];

    // Step 2: Query the thoughtsWall based on the author list
    if (readableAuthors.length === 0) return [];

    const q = query(
        collection(db, 'thoughtsWall'),
        where('authorId', 'in', readableAuthors),
        orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Gets the pending friend request count from the new 'friendships' collection.
 */
export const getPendingFriendRequestCount = async (userId) => {
  if (!userId) return 0;

  // NOTE: We now query the 'friendships' collection
  const requestsRef = collection(db, "friendships");
  const q = query(requestsRef, where("userId2", "==", userId), where("status", "==", "requested"));
  
  try {
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error getting friend request count:", error);
    return 0;
  }
};