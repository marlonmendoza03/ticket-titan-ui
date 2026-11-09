import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { mockCategories, wait } from "../data/storyMocks";
import type {
  CategoryDto,
  SendStoryMessageArgs,
  StoryChatResponse,
} from "../types/story";
import { API_BASE_URL } from "./api";

// getCategories stays mocked until the backend exposes GET api/categories.
// Swap its `queryFn` for a `query` (like sendStoryMessage) once it exists.
export const storyApi = createApi({
  reducerPath: "storyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    timeout: 30000,
  }),
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    getCategories: builder.query<CategoryDto[], void>({
      queryFn: async () => {
        await wait(400);
        return { data: mockCategories.filter((c) => c.isActive) };
      },
      providesTags: ["Category"],
    }),

    sendStoryMessage: builder.mutation<StoryChatResponse, SendStoryMessageArgs>(
      {
        query: ({ request, token }) => ({
          url: "api/story/chat",
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": token,
          },
          body: request,
        }),
      },
    ),
  }),
});

export const { useGetCategoriesQuery, useSendStoryMessageMutation } = storyApi;
