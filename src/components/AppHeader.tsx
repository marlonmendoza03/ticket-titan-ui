import { Button } from "@mui/material";
import { TicketCheck } from "lucide-react";
import { Link } from "react-router";

export const AppHeader = () => (
  <header className="app-header">
    <Link className="brand" to="/" aria-label="Ticket Titan home">
      <span className="brand-mark" aria-hidden="true">
        <TicketCheck size={20} strokeWidth={2.2} />
      </span>
      <span>Ticket Titan</span>
    </Link>
    <div className="header-actions">
      <span className="workspace-label">Support workspace</span>
      <Button variant="outlined" color="primary" size="small">
        Log in
      </Button>
    </div>
  </header>
);
