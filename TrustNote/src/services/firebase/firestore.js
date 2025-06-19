import { doc, setDoc, getDoc, serverTimestamp, addDoc, collection, query, where, getDocs, orderBy, getCountFromServer, updateDoc, deleteDoc, runTransaction, increment, arrayUnion } from 'firebase/firestore';
import { db } from './config';

// All of your existing functions are preserved...

export const createUserProfile = (uid, email, username) => {
  const userDocRef = doc(db, 'users', uid);
  return setDoc(userDocRef, {
    uid: uid, email: email, displayName: username,
    avatar: `https://api.dicebear.com/8.x/pixel-art/png?seed=${username}`,
    createdAt: serverTimestamp(), lastActive: serverTimestamp(),
    isProfilePublic: true, allowFriendRequests: true, shareThoughtsPublicly: true,
    theme: 'dark', defaultNoteColor: '#FFFFE0', friendsCount: 0, totalThoughts: 0, publicThoughts: 0,
    notificationSettings: { friendRequests: true, gameInvites: true, thoughtsWallActivity: true, },
    gameStats: { totalGamesPlayed: 0, totalScore: 0, highestScore: 0, achievements: [], favoriteGameMode: null, }
  });
};

export const getUserProfile = async (uid) => {
  if (!uid) return null;
  const userDocRef = doc(db, 'users', uid);
  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const profileData = docSnap.data();
      if (profileData.createdAt && typeof profileData.createdAt.toDate === 'function') {
        profileData.createdAt = profileData.createdAt.toDate().toISOString();
      }
      if (profileData.lastActive && typeof profileData.lastActive.toDate === 'function') {
        profileData.lastActive = profileData.lastActive.toDate().toISOString();
      }
      return { id: docSnap.id, ...profileData };
    } else {
      console.warn("No user profile found for UID:", uid);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const isUsernameTaken = async (username) => {
  const q = query(collection(db, 'users'), where("displayName", "==", username));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

export const postThoughtToWall = (userId, username, avatar, content) => {
  const thoughtsCollectionRef = collection(db, 'thoughtsWall');
  return addDoc(thoughtsCollectionRef, {
    authorId: userId, authorName: username, authorAvatar: avatar, content: content, contentType: 'text',
    color: ['#FFFFE0', '#ADD8E6', '#90EE90', '#ffb6c1'][Math.floor(Math.random() * 4)],
    visibility: 'friends', allowComments: true, likes: 0, likedBy: [], comments: 0,
    createdAt: serverTimestamp(), position: { x: Math.random(), y: Math.random(), rotation: (Math.random() - 0.5) * 10 },
  });
};

export const getThoughtsFeedForUser = async (userId) => {
    if (!userId) return [];
    const friendsQuery1 = query(collection(db, 'friendships'), where('userId1', '==', userId), where('status', '==', 'accepted'));
    const friendsQuery2 = query(collection(db, 'friendships'), where('userId2', '==', userId), where('status', '==', 'accepted'));
    const [query1Snapshot, query2Snapshot] = await Promise.all([getDocs(friendsQuery1), getDocs(friendsQuery2)]);
    const friendIds = new Set([userId]);
    query1Snapshot.forEach(doc => friendIds.add(doc.data().userId2));
    query2Snapshot.forEach(doc => friendIds.add(doc.data().userId1));
    const readableAuthors = Array.from(friendIds);
    if (readableAuthors.length === 0) return [];
    const q = query(collection(db, 'thoughtsWall'), where('authorId', 'in', readableAuthors), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getPendingFriendRequestCount = async (userId) => {
  if (!userId) return 0;
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

export const searchUsersByDisplayName = async (searchText, currentUserId) => {
  if (!searchText) return [];
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('displayName', '>=', searchText.toLowerCase()), where('displayName', '<=', searchText.toLowerCase() + '\uf8ff'));
  const querySnapshot = await getDocs(q);
  const users = [];
  querySnapshot.forEach(doc => {
    if (doc.id !== currentUserId) {
      users.push({ id: doc.id, ...doc.data() });
    }
  });
  return users;
};

export const sendFriendRequest = (senderId, recipientId) => {
  if (senderId === recipientId) {
    console.error("User cannot add themselves as a friend.");
    return;
  }
  const friendshipsRef = collection(db, 'friendships');
  return addDoc(friendshipsRef, {
    userId1: senderId, userId2: recipientId, initiatedBy: senderId,
    status: 'requested', requestedAt: serverTimestamp(), acceptedAt: null,
  });
};

export const getPendingRequests = async (userId) => {
  if (!userId) return [];
  const requestsQuery = query(collection(db, 'friendships'), where('userId2', '==', userId), where('status', '==', 'requested'));
  const querySnapshot = await getDocs(requestsQuery);
  const requests = [];
  for (const doc of querySnapshot.docs) {
    const requestData = doc.data();
    const senderProfile = await getUserProfile(requestData.userId1);
    if (senderProfile) {
      requests.push({ id: doc.id, ...requestData, sender: senderProfile, });
    }
  }
  return requests;
};

export const acceptFriendRequest = async (request) => {
  const friendshipRef = doc(db, 'friendships', request.id);
  const user1Ref = doc(db, 'users', request.userId1);
  const user2Ref = doc(db, 'users', request.userId2);
  try {
    await runTransaction(db, async (transaction) => {
      transaction.update(friendshipRef, { status: 'accepted', acceptedAt: serverTimestamp() });
      transaction.update(user1Ref, { friendsCount: increment(1) });
      transaction.update(user2Ref, { friendsCount: increment(1) });
    });
    console.log("Friend request accepted and counts updated!");
  } catch (e) {
    console.error("Friend request acceptance transaction failed: ", e);
    throw e;
  }
};

export const declineFriendRequest = (friendshipId) => {
  const requestRef = doc(db, 'friendships', friendshipId);
  return deleteDoc(requestRef);
};

export const getFriendsList = async (userId) => {
  if (!userId) return [];
  const friendshipsRef = collection(db, 'friendships');
  const q1 = query(friendshipsRef, where('userId1', '==', userId), where('status', '==', 'accepted'));
  const q2 = query(friendshipsRef, where('userId2', '==', userId), where('status', '==', 'accepted'));
  const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  const friendIds = new Set();
  snapshot1.forEach(doc => friendIds.add(doc.data().userId2));
  snapshot2.forEach(doc => friendIds.add(doc.data().userId1));
  if (friendIds.size === 0) return [];
  const friends = [];
  for (const id of friendIds) {
    const friendProfile = await getUserProfile(id);
    if (friendProfile) {
      friends.push(friendProfile);
    }
  }
  return friends;
};

export const updateUserProfile = (userId, dataToUpdate) => {
  if (!userId || !dataToUpdate) return;
  const userDocRef = doc(db, 'users', userId);
  return updateDoc(userDocRef, dataToUpdate);
};

export const getFriendshipStatus = async (currentUserId, otherUserId) => {
  if (!currentUserId || !otherUserId) return null;
  const friendshipsRef = collection(db, 'friendships');
  const q1 = query(friendshipsRef, where('userId1', '==', currentUserId), where('userId2', '==', otherUserId));
  const q2 = query(friendshipsRef, where('userId1', '==', otherUserId), where('userId2', '==', currentUserId));
  const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  if (!snapshot1.empty) {
    return snapshot1.docs[0].data().status;
  }
  if (!snapshot2.empty) {
    const status = snapshot2.docs[0].data().status;
    return status === 'requested' ? 'pending_approval' : status;
  }
  return null;
};

export const deleteUserDocument = (userId) => {
  if (!userId) return;
  const userDocRef = doc(db, 'users', userId);
  return deleteDoc(userDocRef);
};

export const unfriendUser = async (currentUserId, friendId) => {
  if (!currentUserId || !friendId) return;
  const friendshipsRef = collection(db, 'friendships');
  const q1 = query(friendshipsRef, where('userId1', '==', currentUserId), where('userId2', '==', friendId));
  const q2 = query(friendshipsRef, where('userId1', '==', friendId), where('userId2', '==', currentUserId));
  const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  const friendshipDoc = snapshot1.docs[0] || snapshot2.docs[0];
  if (!friendshipDoc) {
    console.error("No friendship document found to delete.");
    return;
  }
  const friendshipRef = friendshipDoc.ref;
  const currentUserRef = doc(db, 'users', currentUserId);
  const friendRef = doc(db, 'users', friendId);
  try {
    await runTransaction(db, async (transaction) => {
      transaction.delete(friendshipRef);
      transaction.update(currentUserRef, { friendsCount: increment(-1) });
      transaction.update(friendRef, { friendsCount: increment(-1) });
    });
    console.log("Unfriend transaction successful.");
  } catch (error) {
    console.error("Unfriend transaction failed: ", error);
    throw error;
  }
};

export const getUserByUsername = async (username) => {
  if (!username) return null;
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where("displayName", "==", username.toLowerCase()));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }
  return querySnapshot.docs[0].data();
};

export const createGameRoom = async (hostUser) => {
  if (!hostUser) return null;
  const gameRoomsRef = collection(db, 'gameRooms');
  const newRoom = {
    gameMode: 'most_likely_to', status: 'waiting', maxPlayers: 8,
    players: [ { uid: hostUser.uid, displayName: hostUser.displayName, avatar: hostUser.avatar, isHost: true, } ],
    playerIds: [hostUser.uid], currentRound: 0, totalRounds: 10,
    createdAt: serverTimestamp(), createdBy: hostUser.uid,
  };
  const roomDocRef = await addDoc(gameRoomsRef, newRoom);
  return roomDocRef.id;
};

export const inviteFriendToGame = (roomId, sender, recipient) => {
    if (!roomId || !sender || !recipient) return;
    const invitesRef = collection(db, 'gameInvites');
    return addDoc(invitesRef, {
        senderId: sender.uid, senderName: sender.displayName, recipientId: recipient.id,
        roomId: roomId, gameMode: 'most_likely_to', status: 'pending', createdAt: serverTimestamp(),
    });
};

export const getGameInvites = async (userId) => {
    if (!userId) return [];
    const invitesRef = collection(db, 'gameInvites');
    const q = query(invitesRef, where('recipientId', '==', userId), where('status', '==', 'pending'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const acceptGameInvite = async (inviteId, userProfile, roomId) => {
    const inviteRef = doc(db, 'gameInvites', inviteId);
    const roomRef = doc(db, 'gameRooms', roomId);
    await runTransaction(db, async (transaction) => {
        transaction.update(inviteRef, { status: 'accepted' });
        transaction.update(roomRef, {
            players: arrayUnion({
                uid: userProfile.uid, displayName: userProfile.displayName,
                avatar: userProfile.avatar, isHost: false,
            }),
            playerIds: arrayUnion(userProfile.uid)
        });
    });
};

export const startGame = (roomId, questions) => {
  const roomRef = doc(db, 'gameRooms', roomId);
  return updateDoc(roomRef, {
    status: 'in_progress',
    'gameData.questions': questions,
    'gameData.currentQuestionIndex': 0,
  });
};

// --- THIS IS THE FINAL MISSING FUNCTION ---
/**
 * Fetches all questions for the 'Most Likely To' game.
 */
export const getMostLikelyToQuestions = async () => {
    const questionsRef = collection(db, 'mostLikelyToQuestions');
    const snapshot = await getDocs(questionsRef);

    if (snapshot.empty) {
        console.warn("No questions found in 'mostLikelyToQuestions' collection.");
        return [];
    }
    // Returns an array of strings, e.g., ["Jump off a cliff?", "Forget their birthday?"]
    return snapshot.docs.map(doc => doc.data().text);
};