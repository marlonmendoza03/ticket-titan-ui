import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query";
import type { CreateTicketDto, TicketResponseDto } from "../types/ticket";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error(
    "VITE_API_BASE_URL is not defined in the environment variables.",
  );
}

export const ticketsApi = createApi({
  reducerPath: "ticketsApi",
  baseQuery: fetchBaseQuery({ baseUrl: apiBaseUrl }),
  tagTypes: ["Ticket"],
  endpoints: (builder) => ({
    getTickets: builder.query<TicketResponseDto[], void>({
      query: () => "/Tickets",
      providesTags: ["Ticket"],
    }),

    getTicketById: builder.query<TicketResponseDto, number>({
      query: (id: number) => `/Tickets/${id}`,
      providesTags: ["Ticket"],
    }),

    createTicket: builder.mutation<
      TicketResponseDto,
      Partial<TicketResponseDto>
    >({
      query: (newTicket: CreateTicketDto) => ({
        url: "/Tickets",
        method: "POST",
        body: newTicket,
      }),
      invalidatesTags: ["Ticket"],
    }),

    updateTicketStatus: builder.mutation<
      boolean,
      { id: number; status: string }
    >({
      query: ({ id, status }: { id: number; status: string }) => ({
        url: `/Tickets/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Ticket"],
    }),
  }),
});
