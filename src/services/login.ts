import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GoogleLoginArgs, GoogleLoginReturnType } from "../types/auth";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error(
    "VITE_API_BASE_URL is not defined in the environment variables.",
  );
}

export const loginApi = createApi({
  reducerPath: "loginApi",
  baseQuery: fetchBaseQuery({ baseUrl: apiBaseUrl }),
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
    getCsrfToken: builder.mutation<{ token: string }, void>({
      query: () => ({
        url: "api/auth/csrf-token",
        method: "GET",
        credentials: "include",
      }),
    }),
    getSession: builder.query<GoogleLoginReturnType, void>({
      query: () => ({
        url: "api/auth/session",
        method: "GET",
        credentials: "include",
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
  useGetCsrfTokenMutation,
  useGetSessionQuery,
  useLogoutMutation,
} = loginApi;
