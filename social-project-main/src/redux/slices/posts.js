import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import instance from "../../axios";

export const createPost = createAsyncThunk(
  "posts/createPost",
  async (formData) => {
    const { data } = await instance.post("/posts/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }
);

export const postLike = createAsyncThunk("posts/postLike", async (postId) => {
  const { data } = await instance.post("/likes/", { post: postId });
  return data;
});

export const postLikeDelete = createAsyncThunk(
  "posts/postLikeDelete",
  async (postId) => {
    await instance.delete(`/likes/${postId}`);
    return postId;
  }
);

export const postSave = createAsyncThunk("posts/postSave", async (postId) => {
  const { data } = await instance.post("/save-post/", { post: postId });
  return data;
});

export const postSaveDelete = createAsyncThunk(
  "posts/postSaveDelete",
  async (postId) => {
    await instance.delete(`/save-post/${postId}`);
    return postId;
  }
);

export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  const { data } = await instance.get("/posts/");
  return data;
});

export const fetchComments = createAsyncThunk(
  "posts/fetchComments",
  async (postId) => {
    const { data } = await instance.get(`/comments-post/${postId}`);

    return { postId, comments: data };
  }
);

export const createComment = createAsyncThunk(
  "posts/createComment",
  async ({ postId, content, parent = null }) => {
    const { data } = await instance.post("/comments/", {
      content,
      post: postId,
      parent,
    });
    return data;
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState: {
    items: [],
    status: "loading",
    comments: null,
  },
  reducers: {
    clearComments: (state) => {
      state.comments = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "loaded";
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state) => {
        state.status = "error";
        state.items = [];
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments = action.payload;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.comments.comments = [...state.comments.comments, action.payload];
      });
  },
});

export const { clearComments } = postsSlice.actions;

export const postsReducer = postsSlice.reducer;
