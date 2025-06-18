// src/services/firebase/auth.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  getAuth,
  deleteUser as firebaseDeleteUser,
  // --- 1. Import the functions needed for re-authentication ---
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { auth } from './config';

export const signUpUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signInUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = () => {
  return firebaseSignOut(auth);
};

export const deleteCurrentUserAccount = () => {
  const user = getAuth().currentUser;
  if (user) {
    return firebaseDeleteUser(user);
  } else {
    throw new Error("No user is currently signed in to delete.");
  }
};

// --- 2. Add the new function to re-authenticate the user ---
/**
 * Re-authenticates the current user with their password.
 * This is required before performing sensitive operations like account deletion.
 */
export const reauthenticateUser = (password) => {
  const user = getAuth().currentUser;
  // Get credentials for the user with their email and the password they just entered.
  const credential = EmailAuthProvider.credential(user.email, password);
  // Use the credentials to re-authenticate.
  return reauthenticateWithCredential(user, credential);
};