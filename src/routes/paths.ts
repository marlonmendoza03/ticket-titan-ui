export const ROUTES = {
  Home: "/",
  Tickets: "/tickets",
  TicketDetails: (id: number | string) => `/tickets/${id}`,
  CreateTicket: "/tickets/create",
} as const;

export type RouteKeys = keyof typeof ROUTES;
