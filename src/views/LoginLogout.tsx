import { Button } from "@mui/material";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { TicketTitanModal } from "../components/TicketTitanModal";
import { useGoogleLoginMutation, useLogoutMutation } from "../api/login";
import { useState } from "react";
import { useAuth } from "../hooks/authContext";

export const LoginLogout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [googleLogin, { isLoading: isGoogleLoginLoading }] =
    useGoogleLoginMutation();
  const [logoutRequest, { isLoading: isLoggingOut }] = useLogoutMutation();
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const isLoginRequestLoading = isGoogleLoginLoading;
  const isLoading = isAuthLoading || isLoginRequestLoading || isLoggingOut;

  const token = user?.csrfToken || "";

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      console.error("Google sign-in succeeded without returning a credential.");
      return;
    }

    try {
      await googleLogin({ idToken, token }).unwrap();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Google login request failed:", error);
    }
  };

  const handleError = () => {
    console.error("Google sign-in failed.");
  };

  const handleLoginLogoutButton = async () => {
    if (!isAuthenticated) {
      setIsModalOpen(true);
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
      <Button
        variant="outlined"
        color="primary"
        size="small"
        onClick={handleLoginLogoutButton}
        disabled={isLoading}
      >
        {isAuthLoading
          ? "Checking session…"
          : isLoggingOut
            ? "Logging out…"
            : isGoogleLoginLoading
              ? "Signing in…"
              : isLoading
                ? "Loading…"
                : isAuthenticated
                  ? "Logout"
                  : "Login"}
      </Button>
      {!isAuthenticated && (
        <TicketTitanModal
          open={isModalOpen && !isLoading}
          onClose={() => setIsModalOpen(false)}
          title="Login"
          cancelButtonText="Cancel"
        >
          <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
        </TicketTitanModal>
      )}
    </>
  );
};
