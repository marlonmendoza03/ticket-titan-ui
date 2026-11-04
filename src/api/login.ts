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
  endpoints: (builder) => ({
    googleLogin: builder.mutation<GoogleLoginReturnType, GoogleLoginArgs>({
      query: ({
        googleToken,
        token,
      }: {
        googleToken: string;
        token: string;
      }) => ({
        url: "/google-login",
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": token,
        },
        body: { token: googleToken },
      }),
    }),
    getCsrfToken: builder.mutation<{ token: string }, void>({
      query: () => ({
        url: "auth/csrf-token",
        method: "POST",
        credentials: "include",
      }),
    }),
  }),
});

export const { useGoogleLoginMutation, useGetCsrfTokenMutation } = loginApi;
