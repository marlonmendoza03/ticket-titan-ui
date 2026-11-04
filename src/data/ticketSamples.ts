export interface TicketRow {
  id: number;
  subject: string;
  requester: string;
  category: string;
  status: "Open" | "In progress" | "Resolved";
  updated: string;
}

export const sampleTickets: TicketRow[] = [
  {
    id: 1842,
    subject: "Unable to reset my account password",
    requester: "Maya Chen",
    category: "Account access",
    status: "Open",
    updated: "8 min ago",
  },
  {
    id: 1841,
    subject: "Invoice download shows an error",
    requester: "Noah Williams",
    category: "Billing",
    status: "In progress",
    updated: "24 min ago",
  },
  {
    id: 1840,
    subject: "Add a teammate to our workspace",
    requester: "Olivia Martin",
    category: "Workspace",
    status: "Open",
    updated: "1 hr ago",
  },
  {
    id: 1839,
    subject: "Mobile app closes after sign in",
    requester: "Ethan Brooks",
    category: "Technical issue",
    status: "Resolved",
    updated: "2 hrs ago",
  },
];
