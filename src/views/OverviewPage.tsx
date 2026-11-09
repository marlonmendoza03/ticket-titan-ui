import { Button, Paper } from "@mui/material";
import { Plus } from "lucide-react";
import { Link } from "react-router";
import { PageHeading } from "../components/PageHeading";
import { TicketTable } from "../components/TicketTable";
import { sampleTickets } from "../data/ticketSamples";

export const OverviewPage = () => (
  <>
    <PageHeading
      title="Your content tickets, at a glance."
      description="Keep an eye on incoming requests and pick up where your team left off."
      action={
        <Button
          component={Link}
          to="/tickets/create"
          variant="contained"
          startIcon={<Plus size={17} />}
        >
          Create Story Ticket
        </Button>
      }
    />

    <Paper className="overview-summary" elevation={0}>
      <div className="summary-intro">
        <span className="summary-mark" aria-hidden="true" />
        <div>
          <strong>Queue snapshot</strong>
          <span>Latest queue activity</span>
        </div>
      </div>
      <div className="summary-metrics">
        <div className="summary-metric">
          <strong>12</strong>
          <span>Open tickets</span>
        </div>
        <div className="summary-metric">
          <strong>4</strong>
          <span>In progress</span>
        </div>
        <div className="summary-metric summary-metric-attention">
          <strong>3</strong>
          <span>Need attention</span>
        </div>
      </div>
    </Paper>

    <section className="ticket-section" aria-labelledby="recent-tickets-title">
      <div className="section-heading">
        <div>
          <h2 id="recent-tickets-title">Recent tickets</h2>
          <p>Latest activity from your content queue</p>
        </div>
        <Link className="text-link" to="/tickets">
          View all tickets
        </Link>
      </div>
      <TicketTable tickets={sampleTickets.slice(0, 4)} />
    </section>
  </>
);
