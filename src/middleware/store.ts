import { configureStore } from "@reduxjs/toolkit";
import { loginApi } from "../api/login";
import { ticketsApi } from "../api/ticketsApi";

export const store = configureStore({
  reducer: {
    [loginApi.reducerPath]: loginApi.reducer,
    [ticketsApi.reducerPath]: ticketsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(ticketsApi.middleware, loginApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
