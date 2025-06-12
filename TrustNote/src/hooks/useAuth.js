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
            if (user) {
                // User is signed in, get their profile
                const userProfileDoc = await getUserProfile(user.uid);
                if(userProfileDoc.exists()){
                    dispatch(setUserProfile(userProfileDoc.data().profile));
                }
                dispatch(setAuthUser({ uid: user.uid, email: user.email }));
            } else {
                // User is signed out
                dispatch(clearAuth());
            }
            setLoading(false);
        });

        return unsubscribe;
    }, [dispatch]);

    return { loading };
};