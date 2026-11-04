import { createContext, useContext } from "react";

export type AuthUser = {
  email?: string;
  isLoggedIn: true;
};

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData?: Pick<AuthUser, "email">) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
};
