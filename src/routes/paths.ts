export const ROUTES = {
  Home: "/",
  Login: "/login",
  Tickets: "/tickets",
  TicketDetails: (id: string) => `/tickets/${id}`,
  CreateStory: "/stories/create",
} as const;

export type RouteKeys = keyof typeof ROUTES;
