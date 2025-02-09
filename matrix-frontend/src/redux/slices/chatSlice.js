import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  rooms: [],
  activeRoom: null,
  loading: false,
  error: null
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setRooms: (state, action) => {
      state.rooms = action.payload;
    },
    setActiveRoom: (state, action) => {
      state.activeRoom = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { 
  setMessages, 
  addMessage, 
  setRooms, 
  setActiveRoom, 
  setLoading, 
  setError 
} = chatSlice.actions;

export default chatSlice.reducer;