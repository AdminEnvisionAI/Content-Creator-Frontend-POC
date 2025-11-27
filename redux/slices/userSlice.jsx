import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: JSON.parse(localStorage.getItem('nexus_user')) || null,
  token: localStorage.getItem('nexus_token') || null,
  isAuthenticated: !!localStorage.getItem('nexus_token'),
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('nexus_token', action.payload.token);
      localStorage.setItem('nexus_user', JSON.stringify(action.payload.user));
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('nexus_token');
      localStorage.removeItem('nexus_user');
    },
    updateConnectionStatus: (state, action) => {
      if (state.user) {
         state.user.isFBGraphConnected = action.payload;
        localStorage.setItem('nexus_user', JSON.stringify(state.user));
      }
    },
  },
});

export const { setLogin, setLogout, updateConnectionStatus } = userSlice.actions;

export const selectUser = (state) => state.user.user;

export default userSlice.reducer;