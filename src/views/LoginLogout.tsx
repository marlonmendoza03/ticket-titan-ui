import { Button } from "@mui/material";
import { Link } from "react-router";
import { useGetCsrfTokenQuery, useLogoutMutation } from "../api/login";
import { useAuth } from "../hooks/authContext";
import { ROUTES } from "../routes/paths";

const isAntiforgeryTokenError = (error: unknown) => {
  if (typeof error !== "object" || error === null || !("data" in error)) {
    return false;
  }

  const { data } = error;
  const message =
    typeof data === "string"
      ? data
      : typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof data.message === "string"
        ? data.message
        : "";

  return /valid anti[- ]forgery token is required/i.test(message);
};

export const LoginLogout = () => {
  const { refetch: refreshCsrfToken, isFetching: isFetchingCsrfToken } =
    useGetCsrfTokenQuery();
  const [logoutRequest, { isLoading: isLoggingOut }] = useLogoutMutation();
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();

  const handleLogout = async () => {
    let token = user?.csrfToken?.trim();
    if (!token) {
      console.error("Logout request skipped because no CSRF token is available.");
      return;
    }

    try {
      try {
        await logoutRequest(token).unwrap();
      } catch (error) {
        if (!isAntiforgeryTokenError(error)) throw error;

        const refreshedToken = (await refreshCsrfToken().unwrap()).token?.trim();
        if (!refreshedToken) {
          throw new Error(
            "The CSRF token endpoint returned an empty token.",
            { cause: error },
          );
        }

        token = refreshedToken;
        await logoutRequest(token).unwrap();
      }
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
          disabled={
            isAuthLoading ||
            isLoggingOut ||
            isFetchingCsrfToken ||
            !user?.csrfToken
          }
        >
          {isLoggingOut ? "Logging out…" : "Logout"}
        </Button>
      )}
    </>
  );
};
