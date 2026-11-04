import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GoogleLoginReturnType } from "../types/auth";

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
    googleLogin: builder.mutation<GoogleLoginReturnType, string>({
      query: (googleToken: string) => ({
        url: "/google-login",
        method: "POST",
        body: { token: googleToken },
      }),
    }),
  }),
});

export const { useGoogleLoginMutation } = loginApi;
