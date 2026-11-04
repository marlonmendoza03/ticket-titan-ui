import { Button, Chip, Paper } from "@mui/material";
import { ArrowLeft, Clock3, UserRound } from "lucide-react";
import { Link } from "react-router";
import { PageHeading } from "../components/PageHeading";

export const TicketDetailsPage = () => (
  <>
    <Link className="back-link" to="/tickets">
      <ArrowLeft size={16} aria-hidden="true" />
      Back to all tickets
    </Link>
    <PageHeading
      title="Unable to reset my account password"
      description="Ticket #1842 · Account access"
      action={
        <Button variant="outlined" disabled>
          Update status
        </Button>
      }
    />
    <div className="detail-layout">
      <Paper className="ticket-description-panel" elevation={0}>
        <div className="detail-panel-heading">
          <h2>Request description</h2>
          <Chip label="Open" size="small" className="status-chip status-open" />
        </div>
        <p>
          I tried to reset my password but the reset link says it has expired.
          Could you send me a new one? I need access before the end of the day.
        </p>
        <div className="requester-line">
          <span className="requester-avatar">MC</span>
          <span>
            <strong>Maya Chen</strong>
            <small>Submitted today at 9:42 AM</small>
          </span>
        </div>
      </Paper>
      <Paper className="ticket-meta-panel" elevation={0}>
        <h2>Ticket details</h2>
        <div className="ticket-meta-item">
          <span>
            <UserRound size={16} aria-hidden="true" />
            Requester
          </span>
          <strong>Maya Chen</strong>
        </div>
        <div className="ticket-meta-item">
          <span>
            <Clock3 size={16} aria-hidden="true" />
            Last updated
          </span>
          <strong>8 minutes ago</strong>
        </div>
        <div className="ticket-meta-item">
          <span>Priority</span>
          <strong className="priority-value">Normal</strong>
        </div>
      </Paper>
    </div>
  </>
);
