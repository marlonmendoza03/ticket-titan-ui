import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { buildMockReply, mockCategories, wait } from "../data/storyMocks";
import type {
  CategoryDto,
  StoryChatRequest,
  StoryChatResponse,
} from "../types/story";
import { API_BASE_URL } from "./api";

// Endpoints use mocked `queryFn`s until the backend exposes
// GET api/categories and the Gemini chat endpoint. Swap each `queryFn`
// for a `query` (like ticketsApi) once those exist.
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

    sendStoryMessage: builder.mutation<StoryChatResponse, StoryChatRequest>({
      queryFn: async (request) => {
        await wait(1200);
        return { data: { message: buildMockReply(request) } };
      },
    }),
  }),
});

export const { useGetCategoriesQuery, useSendStoryMessageMutation } = storyApi;
