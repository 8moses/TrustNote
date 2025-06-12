import { doc, setDoc, getDoc, serverTimestamp, addDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from './config';

export const createUserProfile = (uid, email, username) => {
  const userDocRef = doc(db, 'users', uid);
  return setDoc(userDocRef, {
    profile: {
      name: username,
      avatar: `https://api.dicebear.com/8.x/pixel-art/png?seed=${username}`,
      friends: []
    },
    gameStats: {
      scores: 0,
      achievements: []
    },
    email: email,
    createdAt: serverTimestamp()
  });
};

export const getUserProfile = (uid) => {
  const userDocRef = doc(db, 'users', uid);
  return getDoc(userDocRef);
}

export const isUsernameTaken = async (username) => {
  const q = query(collection(db, 'users'), where("profile.name", "==", username));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

export const postThoughtToWall = (userId, username, content) => {
  const thoughtsCollectionRef = collection(db, 'thoughtsWall');
  return addDoc(thoughtsCollectionRef, {
    author: userId,
    authorUsername: username,
    content: content,
    position: { x: Math.random(), y: Math.random() },
    color: ['#FFFFE0', '#ADD8E6', '#90EE90', '#ffb6c1'][Math.floor(Math.random() * 4)],
    visibility: 'friends',
    timestamp: serverTimestamp()
  });
};

export const getThoughtsFeedForUser = async (userId) => {
    // First, get the user's friend list
    const userProfile = await getUserProfile(userId);
    if (!userProfile.exists()) {
        console.log("No such user!");
        return [];
    }
    const friends = userProfile.data().profile.friends;
    const readableAuthors = [userId, ...friends]; // User can see their own thoughts and their friends'

    // Now, query the thoughtsWall
    if (readableAuthors.length === 0) return [];

    const q = query(
        collection(db, 'thoughtsWall'),
        where('author', 'in', readableAuthors),
        orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};