import { useState, type ReactNode } from "react";
import { AuthContext, type AuthUser } from "./authContext";

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(() =>
    localStorage.getItem("app_token") ? { isLoggedIn: true } : null,
  );

  const login = (token: string, userData: Record<string, unknown> = {}) => {
    localStorage.setItem("app_token", token);
    setUser({ ...userData, isLoggedIn: true });
  };

  const logout = () => {
    localStorage.removeItem("app_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading: false,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
