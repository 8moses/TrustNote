import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getThoughtsFeedForUser } from '../../services/firebase/firestore';

export const fetchThoughts = createAsyncThunk(
    'social/fetchThoughts',
    async (userId, thunkAPI) => {
        const thoughts = await getThoughtsFeedForUser(userId);
        return thoughts;
    }
);

const initialState = {
  thoughts: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchThoughts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchThoughts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.thoughts = action.payload;
      })
      .addCase(fetchThoughts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default socialSlice.reducer;