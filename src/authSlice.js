import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from "./utils/axios";


const normalizeError = (err) => {
  return {
    message: err.response?.data?.message || err.message,
    status: err.response?.status,
    code: err.code,
    isNetworkError: err.code === 'ERR_NETWORK',
    // Add any other relevant error details here
  };
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    
    try {
      
      const response = await axiosClient.post(`${process.env.VITE_API_URL}/user/register`, userData);
      
      return response.data.user;
    } catch (err) {
      
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`${process.env.VITE_API_URL}/user/login`, credentials);
      return response.data.user;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const checkAuth = createAsyncThunk(
  "auth/check",
  async (_, { rejectWithValue }) => {
    try {
      
      const response = await axiosClient.post(`${process.env.VITE_API_URL}/user/check`);
      
      return response.data.user;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post(`${process.env.VITE_API_URL}/user/logout`);
      return null;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);


const authslice=createSlice({
    name: 'auth',
    initialState: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
    },
    reducers:{},
    extraReducers:(bulider)=>{
        bulider
        //for register case
        .addCase(registerUser.pending ,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(registerUser.fulfilled,(state,action)=>{
            state.loading = false;
            state.isAuthenticated = !!action.payload;
            state.user = action.payload;
        })
        .addCase(registerUser.rejected,(state,action)=>{
            state.loading = false;
            state.error = action.payload?.message || 'Something went wrong';
            state.isAuthenticated = false;
            state.user = null;
        })
        // Login User Cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
      })
  
      // Check Auth Cases
      .addCase(checkAuth.pending, (state) => {
       
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
       
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
      })
  
      // Logout User Cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Something went wrong';
        state.isAuthenticated = false;
        state.user = null;
      });
    }
})

export default  authslice.reducer;