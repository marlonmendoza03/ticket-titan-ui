import type { ReactNode } from "react";
import { useGetSessionQuery } from "../api/login";
import { AuthContext, type AuthUser } from "./authContext";

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { data: session, isLoading } = useGetSessionQuery();
  const user: AuthUser | null = session
    ? { email: session.email, isLoggedIn: true }
    : null;

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
