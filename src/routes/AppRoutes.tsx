import { Navigate, Route, Routes } from "react-router";
import { AppShell } from "../components/AppShell";
import { CreateStoryPage } from "../views/CreateStoryPage";
import { OverviewPage } from "../views/OverviewPage";
import { TicketDetailsPage } from "../views/TicketDetailsPage";
import { TicketsPage } from "../views/TicketsPage";
import { ROUTES } from "./paths";

export const AppRoutes = () => (
  <Routes>
    <Route element={<AppShell />}>
      <Route path={ROUTES.Home} element={<OverviewPage />} />
      <Route path={ROUTES.Tickets} element={<TicketsPage />} />
      <Route path={ROUTES.CreateStory} element={<CreateStoryPage />} />
      <Route
        path="/tickets/create"
        element={<Navigate to={ROUTES.CreateStory} replace />}
      />
      <Route
        path={ROUTES.TicketDetails(":id")}
        element={<TicketDetailsPage />}
      />
      <Route path="*" element={<OverviewPage />} />
    </Route>
  </Routes>
);
