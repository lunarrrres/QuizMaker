import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import api from "../api/axios";

interface AuthState {
  user: null | { email: string; token: string; username?: string };
  loading: boolean;
  error: null | string;
}

const initialState: AuthState = { user: null, loading: false, error: null };

export const signIn = createAsyncThunk(
  "auth/signIn",
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ email: string; token: string }>(
        "/api/auth/signin",
        data,
      );
      return response.data;
    } catch (err) {
      let errorMessage = "Server error";
      if (axios.isAxiosError(err) && err.response) {
        errorMessage =
          (err.response.data as { message?: string }).message || errorMessage;
      }
      return rejectWithValue(errorMessage);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signOut: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { signOut } = authSlice.actions;
export default authSlice.reducer;
