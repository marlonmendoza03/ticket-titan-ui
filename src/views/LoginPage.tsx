import { Alert, Button, CircularProgress } from "@mui/material";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { TicketCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useGetCsrfTokenQuery, useGoogleLoginMutation } from "../api/login";
import { useAuth } from "../hooks/authContext";
import { ROUTES } from "../routes/paths";

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "data" in error) {
    const { data } = error;
    if (typeof data === "string") return data;
    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return data.message;
    }
  }

  return "Google sign-in failed. Please try again.";
};

export const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    data: csrfTokenData,
    isLoading: isCsrfLoading,
    isError: isCsrfError,
    refetch: refetchCsrfToken,
  } = useGetCsrfTokenQuery();
  const [googleLogin, { isLoading: isSigningIn }] = useGoogleLoginMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const locationState = location.state;
  const redirectPath =
    typeof locationState === "object" &&
    locationState !== null &&
    "from" in locationState &&
    typeof locationState.from === "string" &&
    locationState.from.startsWith("/") &&
    !locationState.from.startsWith("//")
      ? locationState.from
      : ROUTES.Home;
  const csrfToken = csrfTokenData?.token?.trim();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      setErrorMessage("Google didn't return a sign-in credential.");
      return;
    }
    if (!csrfToken) {
      setErrorMessage("Couldn't verify your request. Please try again.");
      return;
    }

    setErrorMessage(null);
    try {
      await googleLogin({ idToken, token: csrfToken }).unwrap();
    } catch (error) {
      console.error("Google login request failed:", error);
      setErrorMessage(getErrorMessage(error));
    }
  };

  const isChecking = isAuthLoading || isCsrfLoading || isSigningIn;

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand">
          <span className="brand-mark" aria-hidden="true">
            <TicketCheck size={20} strokeWidth={2.2} />
          </span>
          <span>Ticket Titan</span>
        </div>

        <div className="login-intro">
          <h1 id="login-title">Sign in to your access.</h1>
          <p>Continue to your story workspace.</p>
        </div>

        {errorMessage && (
          <Alert severity="error" onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}

        {isCsrfError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={refetchCsrfToken}>
                Retry
              </Button>
            }
          >
            Couldn’t prepare secure sign-in.
          </Alert>
        )}

        <div className="login-action" aria-busy={isChecking}>
          {isChecking ? (
            <div className="login-progress" role="status">
              <CircularProgress size={20} />
              <span>
                {isSigningIn ? "Signing you in…" : "Preparing sign-in…"}
              </span>
            </div>
          ) : csrfToken ? (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() =>
                setErrorMessage("Google sign-in was cancelled or failed.")
              }
              useOneTap={false}
            />
          ) : !isCsrfError ? (
            <Alert severity="error">
              A secure sign-in token isn’t available. Refresh the page to try
              again.
            </Alert>
          ) : null}
        </div>

        <p className="login-footnote">
          Sign in securely with Google. Your workspace opens after verification.
        </p>
      </section>
    </main>
  );
};
