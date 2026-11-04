import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query";
import type { CreateTicketDto, TicketResponseDto } from "../types/ticket";
import { API_BASE_URL } from "../config/api";

export const ticketsApi = createApi({
  reducerPath: "ticketsApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["Ticket"],
  endpoints: (builder) => ({
    getTickets: builder.query<TicketResponseDto[], void>({
      query: () => ({
        url: "api/tickets",
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Ticket"],
    }),

    getTicketById: builder.query<TicketResponseDto, number>({
      query: (id: number) => ({
        url: `api/Tickets/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Ticket"],
    }),

    createTicket: builder.mutation<
      TicketResponseDto,
      { newTicket: Partial<CreateTicketDto>; token: string }
    >({
      query: ({ newTicket, token }) => ({
        url: "api/tickets",
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": token,
        },
        body: newTicket,
      }),
      invalidatesTags: ["Ticket"],
    }),

    updateTicketStatus: builder.mutation<
      void,
      { id: number; status: string; token: string }
    >({
      query: ({
        id,
        status,
        token,
      }: {
        id: number;
        status: string;
        token: string;
      }) => ({
        url: `api/tickets?id=${id}/`,
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": token,
        },
        body: { status },
      }),
      invalidatesTags: ["Ticket"],
    }),
  }),
});
