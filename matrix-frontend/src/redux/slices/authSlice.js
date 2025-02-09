import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null, // Ensure user exists in state
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setUser, clearUser, setError } = authSlice.actions;
export default authSlice.reducer;
