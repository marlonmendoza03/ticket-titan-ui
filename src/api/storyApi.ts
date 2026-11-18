import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { StoryChatMessageDto, StoryChatSessionDto } from "../types/story";
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
  tagTypes: ["Category", "Session"],
  endpoints: (builder) => ({
    //Decommissioning these APIs
    // getCategories: builder.query<CategoryDto[], void>({
    //   queryFn: async () => {
    //     await wait(400);
    //     return { data: mockCategories.filter((c) => c.isActive) };
    //   },
    //   providesTags: ["Category"],
    // }),
    // sendStoryMessage: builder.mutation<
    //   StoryChatResponse,
    //   { storyChatRequest: StoryChatRequest; token: string }
    // >({
    //   query: ({
    //     storyChatRequest: { messages: messages, setup: setup },
    //     token,
    //   }: {
    //     storyChatRequest: StoryChatRequest;
    //     token: string;
    //   }) => ({
    //     url: "api/geminichat/chat",
    //     method: "POST",
    //     credentials: "include",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "X-CSRF-TOKEN": token,
    //     },
    //     body: { messages, setup },
    //   }),
    //   invalidatesTags: ["Category"],
    // }),
    getChatSessions: builder.query<StoryChatSessionDto[], void>({
      query: () => ({
        url: "api/story-chat/sessions",
        method: "GET",
        credentials: "include",
      }),
    }),
    getChatSession: builder.query<StoryChatSessionDto, string>({
      query: (sessionId: string) => ({
        url: `api/story-chat/sessions/${sessionId}`,
        method: "GET",
        credentials: "include",
      }),
    }),
    createSession: builder.mutation<
      StoryChatSessionDto,
      { title: string; token: string }
    >({
      query: ({ title, token }) => ({
        url: "api/story-chat/sessions",
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": token,
        },
        body: title,
      }),
      invalidatesTags: ["Session"],
    }),
    sendMessage: builder.mutation<
      StoryChatSessionDto,
      { sessionId: string; token: string; request: StoryChatMessageDto }
    >({
      query: ({ sessionId, request, token }) => ({
        url: `api/story-chat/sessions/${sessionId}/messages`,
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": token,
        },
        body: request,
        invalidatesTags: ["Session"],
      }),
    }),
    sendInitialMessage: builder.mutation<
      StoryChatSessionDto,
      { token: string; request: StoryChatMessageDto }
    >({
      query: ({ token, request }) => ({
        url: "api/story-chat/sessions/message",
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": token,
        },
        body: {
          Role: 0,
          Content: request.content,
          StorySetup: {
            Category: request.storySetup!.category,
            EpisodeCount: request.storySetup!.episodeCount,
            EpisodeDurationInSec: request.storySetup!.episodeDurationInSec,
          },
        },
        invalidatesTags: ["Session"],
      }),
    }),
  }),
});

export const {
  // useGetCategoriesQuery,
  // useSendStoryMessageMutation,
  useGetChatSessionsQuery,
  useCreateSessionMutation,
  useSendMessageMutation,
  useGetChatSessionQuery,
  useSendInitialMessageMutation,
} = storyApi;
