import { NavLink } from "react-router";
import { ClipboardList, LayoutDashboard, Plus } from "lucide-react";
import { ROUTES } from "../routes/paths";

const navigationItems = [
  { label: "Overview", to: ROUTES.Home, icon: LayoutDashboard, end: true },
  { label: "All tickets", to: ROUTES.Tickets, icon: ClipboardList, end: false },
  { label: "New ticket", to: ROUTES.CreateTicket, icon: Plus, end: true },
];

export const SideNavigation = () => (
  <nav className="side-navigation" aria-label="Main navigation">
    <p className="navigation-label">Workspace</p>
    {navigationItems.map(({ label, to, icon: Icon, end }) => (
      <NavLink
        key={label}
        to={to}
        end={end}
        className={({ isActive }) =>
          `navigation-link${isActive ? " is-active" : ""}`
        }
      >
        <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
        <span>{label}</span>
      </NavLink>
    ))}
  </nav>
);
