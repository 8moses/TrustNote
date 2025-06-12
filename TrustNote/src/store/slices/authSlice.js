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
    setAuthUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setUserProfile: (state, action) => {
        state.profile = action.payload;
    },
    clearAuth: (state) => {
        state.user = null;
        state.profile = null;
        state.isAuthenticated = false;
    }
  },
});

export const { setAuthUser, setUserProfile, clearAuth } = authSlice.actions;
export default authSlice.reducer;