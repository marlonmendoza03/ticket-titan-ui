import { configureStore } from "@reduxjs/toolkit";
import { loginApi } from "../api/login";
import { storyApi } from "../api/storyApi";
import { ticketsApi } from "../api/ticketsApi";

export const store = configureStore({
  reducer: {
    [loginApi.reducerPath]: loginApi.reducer,
    [ticketsApi.reducerPath]: ticketsApi.reducer,
    [storyApi.reducerPath]: storyApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      ticketsApi.middleware,
      loginApi.middleware,
      storyApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
