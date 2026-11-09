import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GoogleLoginArgs, GoogleLoginReturnType } from "../types/auth";
import { API_BASE_URL } from "./api";

export const loginApi = createApi({
  reducerPath: "loginApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    timeout: 30000,
  }),
  tagTypes: ["Session"],
  endpoints: (builder) => ({
    googleLogin: builder.mutation<GoogleLoginReturnType, GoogleLoginArgs>({
      query: ({ idToken, token }: { idToken: string; token: string }) => ({
        url: "api/auth/google-login",
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": token,
        },
        body: { idToken },
      }),
      invalidatesTags: ["Session"],
    }),
    getCsrfToken: builder.query<{ token: string }, void>({
      query: () => ({
        url: "api/auth/csrf-token",
        method: "GET",
        credentials: "include",
      }),
    }),
    getSession: builder.query<GoogleLoginReturnType | null, void>({
      query: () => ({
        url: "api/auth/session",
        method: "GET",
        credentials: "include",
        timeout: 5000,
      }),
      providesTags: ["Session"],
    }),
    logout: builder.mutation<void, string>({
      query: (token: string) => ({
        url: "api/auth/logout",
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRF-TOKEN": token,
        },
      }),
      invalidatesTags: ["Session"],
    }),
  }),
});

export const {
  useGoogleLoginMutation,
  useGetCsrfTokenQuery,
  useGetSessionQuery,
  useLogoutMutation,
} = loginApi;
