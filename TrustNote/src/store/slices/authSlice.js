// src/store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  profile: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Your original action to set the user from Firebase
    setAuthUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    // Your original action to set the profile from Firestore
    setUserProfile: (state, action) => {
      state.profile = action.payload;
    },
    // Your original action to clear everything on logout
    clearAuth: (state) => {
      state.user = null;
      state.profile = null;
      state.isAuthenticated = false;
    }
  },
});

export const { setAuthUser, setUserProfile, clearAuth } = authSlice.actions;
export default authSlice.reducer;