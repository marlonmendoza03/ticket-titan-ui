import { Outlet } from "react-router";
import { AppFooter } from "./AppFooter";
import { AppHeader } from "./AppHeader";
import { SideNavigation } from "./SideNavigation";

export const AppShell = () => (
  <div className="app-shell">
    <AppHeader />
    <div className="workspace">
      <SideNavigation />
      <main className="main-content">
        <div className="page-content">
          <Outlet />
        </div>
        <AppFooter />
      </main>
    </div>
  </div>
);
