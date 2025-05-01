import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import instance from "../../axios";

export const fetchSubscribers = createAsyncThunk(
  "subscribe/fetchSubscribers",
  async (userId) => {
    const { data } = await instance.get(`/subscriptions/`);
    return data;
  }
);

export const fetchMySubscriptions = createAsyncThunk(
  "subscribe/fetchMySubscriptions",
  async () => {
    const { data } = await instance.get(`/subscriptions/`);
    return data;
  }
);

export const subscribeToUser = createAsyncThunk(
  "subscribe/subscribeToUser",
  async (userId) => {
    const { data } = await instance.post(`/subscribe/${userId}/`);
    return data;
  }
);

export const unsubscribeFromUser = createAsyncThunk(
  "subscribe/unsubscribeFromUser",
  async (userId) => {
    await instance.delete(`/subscribe/${userId}/`);
    return userId;
  }
);

const subscribeSlice = createSlice({
  name: "subscribe",
  initialState: {
    mySubscriptions: [],
    userSubscribers: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMySubscriptions.fulfilled, (state, action) => {
        state.mySubscriptions = action.payload;
      })
      .addCase(fetchSubscribers.fulfilled, (state, action) => {
        state.userSubscribers = action.payload;
      });
  },
});

export const subscribeReducer = subscribeSlice.reducer;
