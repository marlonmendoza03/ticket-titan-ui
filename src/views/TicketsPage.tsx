import { Button } from "@mui/material";
import { Plus } from "lucide-react";
import { Link } from "react-router";
import { ROUTES } from "../routes/paths";
import { PageHeading } from "../components/PageHeading";
import { TicketTable } from "../components/TicketTable";

export const TicketsPage = () => {
  return (
    <>
      <PageHeading
        title="All Content Tickets"
        description="Browse recent requests and see where each one stands."
        action={
          <Button
            component={Link}
            to={ROUTES.CreateStory}
            variant="contained"
            startIcon={<Plus size={17} />}
          >
            Create story
          </Button>
        }
      />
      <div className="list-toolbar">
        <span className="list-filter-note">Most recently updated</span>
      </div>
      <TicketTable />
    </>
  );
};
