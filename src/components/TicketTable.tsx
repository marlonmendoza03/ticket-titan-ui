import { Chip, Paper } from "@mui/material";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { sampleTickets, type TicketRow } from "../data/ticketSamples";

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
