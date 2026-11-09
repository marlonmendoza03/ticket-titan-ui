import { Outlet } from "react-router";
import { useSelector } from "react-redux";
import { loginApi } from "../api/login";
import { ticketsApi } from "../api/ticketsApi";
import type { RootState } from "../middleware/store";
import { AppFooter } from "./AppFooter";
import { AppHeader } from "./AppHeader";
import Loading from "./Loading";
import { SideNavigation } from "./SideNavigation";

const hasPendingApiRequests = (state: RootState) =>
  [state[ticketsApi.reducerPath], state[loginApi.reducerPath]].some(
    ({ queries, mutations }) =>
      Object.values(queries).some((request) => request?.status === "pending") ||
      Object.values(mutations).some(
        (request) => request?.status === "pending",
      ),
  );

export const AppShell = () => {
  const isLoading = useSelector(hasPendingApiRequests);

  return (
    <div className="app-shell">
      <AppHeader />
      <div className="workspace">
        <SideNavigation />
        <main className="main-content">
          <div className="page-content" aria-busy={isLoading}>
            <Outlet />
            {isLoading && (
              <div className="page-loading-overlay" role="status">
                <Loading />
              </div>
            )}
          </div>
          <AppFooter />
        </main>
      </div>
    </div>
  );
};
