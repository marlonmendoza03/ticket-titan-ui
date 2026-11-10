import { Navigate, Outlet, Route, Routes, useLocation } from "react-router";
import { AppShell } from "../components/AppShell";
import Loading from "../components/Loading";
import { useAuth } from "../hooks/authContext";
import { CreateStoryPage } from "../views/CreateStoryPage";
import { LoginPage } from "../views/LoginPage";
import { OverviewPage } from "../views/OverviewPage";
import { TicketDetailsPage } from "../views/TicketDetailsPage";
import { TicketsPage } from "../views/TicketsPage";
import { ROUTES } from "./paths";

const RequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="route-loading" role="status" aria-label="Checking sign-in">
        <Loading />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.Login}
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
      />
    );
  }

  return <Outlet />;
};

export const AppRoutes = () => (
  <Routes>
    <Route path={ROUTES.Login} element={<LoginPage />} />
    <Route element={<RequireAuth />}>
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
    </Route>
  </Routes>
);
