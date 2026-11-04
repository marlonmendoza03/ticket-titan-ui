import { LifeBuoy } from "lucide-react";

export const AppFooter = () => (
  <footer className="app-footer">
    <span>Ticket Titan</span>
    <span className="footer-help">
      <LifeBuoy size={15} aria-hidden="true" />
      Help & support
    </span>
  </footer>
);
