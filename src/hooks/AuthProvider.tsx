import type { ReactNode } from "react";
import { useGetCsrfTokenQuery, useGetSessionQuery } from "../api/login";
import { AuthContext, type AuthUser } from "./authContext";

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { data: session, isLoading: isGetSessionLoading } =
    useGetSessionQuery();
  const { data: token, isLoading: isTokenLoading } = useGetCsrfTokenQuery();

  const user: AuthUser | null = session
    ? { email: session.email, isLoggedIn: true, csrfToken: token?.token }
    : null;

  const isLoading = isTokenLoading || isGetSessionLoading;
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
