import { Button } from "@mui/material";
import { TicketCheck } from "lucide-react";
import { Link } from "react-router";
import { TicketTitanModal } from "./TicketTitanModal";
import { useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useGetCsrfTokenMutation, useGoogleLoginMutation } from "../api/login";
import { useAuth } from "../hooks/authContext";

export const AppHeader = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [googleLogin] = useGoogleLoginMutation();
  const [getCsrfToken] = useGetCsrfTokenMutation();
  const { isAuthenticated, logout, login } = useAuth();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const googleToken = credentialResponse.credential;
    if (!googleToken) {
      console.error("Google sign-in succeeded without returning a credential.");
      return;
    }

    try {
      const csrfResponse = await getCsrfToken().unwrap();
      const { token } = await csrfResponse;
      const session = await googleLogin({ googleToken, token }).unwrap();
      login(session.token, { email: session.email });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Google login request failed:", error);
    }
  };

  const handleError = () => {
    console.error("Google sign-in failed.");
  };

  const handleLoginLogoutButton = () => {
    if (!isAuthenticated) {
      setIsModalOpen(true);
    } else {
      logout();
    }
  };

  return (
    <header className="app-header">
      <Link className="brand" to="/" aria-label="Ticket Titan home">
        <span className="brand-mark" aria-hidden="true">
          <TicketCheck size={20} strokeWidth={2.2} />
        </span>
        <span>Ticket Titan</span>
      </Link>
      <div className="header-actions">
        <span className="workspace-label">Support workspace</span>

        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={handleLoginLogoutButton}
        >
          {isAuthenticated ? "Logout" : "Login"}
        </Button>
        {!isAuthenticated && (
          <TicketTitanModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Login"
            cancelButtonText="Cancel"
          >
            <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
          </TicketTitanModal>
        )}
      </div>
    </header>
  );
};
