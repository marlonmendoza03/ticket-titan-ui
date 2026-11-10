export const ROUTES = {
  Home: "/",
  Login: "/login",
  Tickets: "/tickets",
  TicketDetails: (id: number | string) => `/tickets/${id}`,
  CreateStory: "/stories/create",
} as const;

export type RouteKeys = keyof typeof ROUTES;
