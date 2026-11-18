import { NavLink, useParams } from "react-router";
import { ClipboardList, LayoutDashboard, Plus, FilePen } from "lucide-react";
import { ROUTES } from "../routes/paths";

export const SideNavigation = () => {
  const { id: sessionId } = useParams();

  const navigationItems = [
    { label: "Overview", to: ROUTES.Home, icon: LayoutDashboard, end: true },
    {
      label: "All tickets",
      to: ROUTES.Tickets,
      icon: ClipboardList,
      end: true,
    },
    ...(sessionId
      ? [
          {
            label: "Ticket",
            to: ROUTES.TicketDetails(sessionId!),
            icon: FilePen,
            end: true,
          },
        ]
      : []),
    { label: "New story", to: ROUTES.CreateStory, icon: Plus, end: true },
  ];

  return (
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
};
