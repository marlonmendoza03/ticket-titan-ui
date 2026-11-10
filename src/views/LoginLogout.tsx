import { Button } from "@mui/material";
import { Link } from "react-router";
import { useLogoutMutation } from "../api/login";
import { useAuth } from "../hooks/authContext";
import { ROUTES } from "../routes/paths";

export const LoginLogout = () => {
  const [logoutRequest, { isLoading: isLoggingOut }] = useLogoutMutation();
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();

  const handleLogout = async () => {
    const token = user?.csrfToken?.trim();
    if (!token) {
      console.error("Logout request skipped because no CSRF token is available.");
      return;
    }
    try {
      await logoutRequest(token).unwrap();
    } catch (error) {
      console.error("Logout request failed:", error);
    }
  };

  return (
    <>
      {!isAuthenticated && (
        <Button
          component={Link}
          to={ROUTES.Login}
          variant="outlined"
          color="primary"
          size="small"
          disabled={isAuthLoading}
        >
          Sign in
        </Button>
      )}
      {isAuthenticated && (
        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={handleLogout}
          disabled={isAuthLoading || isLoggingOut || !user?.csrfToken}
        >
          {isLoggingOut ? "Logging out…" : "Logout"}
        </Button>
      )}
    </>
  );
};
