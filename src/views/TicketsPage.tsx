import { Button } from "@mui/material";
import { Plus } from "lucide-react";
import { Link } from "react-router";
import { PageHeading } from "../components/PageHeading";
import { TicketTable } from "../components/TicketTable";

export const TicketsPage = () => (
  <>
    <PageHeading
      title="All tickets"
      description="Browse recent requests and see where each one stands."
      action={
        <Button
          component={Link}
          to="/tickets/create"
          variant="contained"
          startIcon={<Plus size={17} />}
        >
          Create ticket
        </Button>
      }
    />
    <div className="list-toolbar">
      <span className="list-count">Showing 4 sample tickets</span>
      <span className="list-filter-note">Most recently updated</span>
    </div>
    <TicketTable />
  </>
);
