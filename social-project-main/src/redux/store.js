import { configureStore } from "@reduxjs/toolkit";

import { authReducer } from "./slices/auth";
import { postsReducer } from "./slices/posts";
import { subscribeReducer } from "./slices/subscribe";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    subscribe: subscribeReducer,
  },
});
