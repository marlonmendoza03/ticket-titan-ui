import { Chip, Paper } from "@mui/material";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";

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

interface TicketTableProps {
  tickets?: TicketRow[];
}

export const TicketTable = ({ tickets = sampleTickets }: TicketTableProps) => (
  <Paper className="ticket-table-paper" elevation={0}>
    <div className="table-scroll">
      <table className="ticket-table">
        <thead>
          <tr>
            <th scope="col">Ticket</th>
            <th scope="col">Requester</th>
            <th scope="col">Category</th>
            <th scope="col">Status</th>
            <th scope="col">Updated</th>
            <th scope="col">
              <span className="visually-hidden">Open ticket</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>
                <Link
                  className="ticket-subject"
                  to={`/tickets/${ticket.id}`}
                >
                  <span className="ticket-id">#{ticket.id}</span>
                  <span>{ticket.subject}</span>
                </Link>
              </td>
              <td>{ticket.requester}</td>
              <td>{ticket.category}</td>
              <td>
                <Chip
                  label={ticket.status}
                  size="small"
                  className={`status-chip status-${ticket.status
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                />
              </td>
              <td>{ticket.updated}</td>
              <td>
                <Link
                  className="ticket-open-link"
                  to={`/tickets/${ticket.id}`}
                  aria-label={`View ticket ${ticket.id}`}
                >
                  <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Paper>
);
