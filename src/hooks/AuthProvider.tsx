import { useState, type ReactNode } from "react";
import { AuthContext, type AuthUser } from "./authContext";

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(() =>
    localStorage.getItem("app_token")
      ? {
          email: localStorage.getItem("app_email") ?? undefined,
          isLoggedIn: true,
        }
      : null,
  );

  const login = (token: string, userData: Pick<AuthUser, "email"> = {}) => {
    localStorage.setItem("app_token", token);
    if (userData.email) {
      localStorage.setItem("app_email", userData.email);
    }
    setUser({ ...userData, isLoggedIn: true });
  };

  const logout = () => {
    localStorage.removeItem("app_token");
    localStorage.removeItem("app_email");
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
