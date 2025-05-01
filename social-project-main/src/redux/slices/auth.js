import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import instance from "../../axios";

export const fetchAuth = createAsyncThunk("auth/fetchAuth", async (params) => {
  const { data } = await instance.post("login/", params);
  return data;
});

export const fetchRegister = createAsyncThunk(
  "auth/fetchRegister",
  async (params) => {
    const { data } = await instance.post("register/", params, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  }
);

export const fetchUpdateUser = createAsyncThunk(
  "auth/fetchUpdateUser",
  async ({ id, formData }) => {
    const token = window.localStorage.getItem("token");

    const { data } = await instance.patch(`users/${id}/`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  }
);

export const selectIsAuth = (state) => Boolean(state.auth.data);

const getUserFromLocalStorage = () => {
  const user = localStorage.getItem("user");
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    console.error("Error parsing user from localStorage", e);
    return null;
  }
};

const initialState = {
  data: localStorage.getItem("token")
    ? {
        token: localStorage.getItem("token"),
        user: getUserFromLocalStorage(),
      }
    : null,
  status: "loaded",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.data = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuth.pending, (state) => {
        state.status = "loading";
        state.data = null;
      })
      .addCase(fetchAuth.fulfilled, (state, action) => {
        state.status = "loaded";
        state.data = action.payload;
      })
      .addCase(fetchAuth.rejected, (state) => {
        state.status = "error";
        state.data = null;
      })

      .addCase(fetchRegister.pending, (state) => {
        state.status = "loading";
        state.data = null;
      })
      .addCase(fetchRegister.fulfilled, (state, action) => {
        state.status = "loaded";
        state.data = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload?.user));
      })
      .addCase(fetchRegister.rejected, (state) => {
        state.status = "error";
        state.data = null;
      })
      .addCase(fetchUpdateUser.fulfilled, (state, action) => {
        if (state.data) {
          state.data.user = action.payload;
          localStorage.setItem("user", JSON.stringify(action.payload));
        }
      });
  },
});

export const { logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
