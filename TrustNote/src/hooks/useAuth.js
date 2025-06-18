import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { auth } from '../services/firebase/config';
import { getUserProfile } from '../services/firebase/firestore';
import { setAuthUser, setUserProfile, clearAuth } from '../store/slices/authSlice';

export const useAuth = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                if (user) {
                    // user is a valid auth user from Firebase.
                    // Let's get our profile data object from Firestore.
                    const userProfile = await getUserProfile(user.uid);

                    // The check is now much simpler. We just see if the profile object exists.
                    if (userProfile) {
                        // The user exists and we have their profile data.
                        // Dispatch the serializable data to Redux.
                        dispatch(setAuthUser({ uid: user.uid, email: user.email }));
                        dispatch(setUserProfile(userProfile)); // userProfile is already a plain object
                    } else {
                        // This is a rare edge case where a user is authenticated
                        // but has no profile document in the database.
                        // To be safe, we should clear their auth state.
                        console.error(`User is authenticated (uid: ${user.uid}) but has no Firestore profile.`);
                        dispatch(clearAuth());
                    }
                } else {
                    // User is signed out.
                    dispatch(clearAuth());
                }
            } catch (error) {
                console.error("Critical error in auth state listener:", error);
                // If any error occurs during the process, clear auth state.
                dispatch(clearAuth());
            } finally {
                // This block will ALWAYS run, even if an error is thrown in the try block.
                // This guarantees we never get stuck on the loading screen.
                setLoading(false);
            }
        });

        // Cleanup the subscription when the component unmounts
        return () => unsubscribe();
    }, [dispatch]);

    return { loading };
};