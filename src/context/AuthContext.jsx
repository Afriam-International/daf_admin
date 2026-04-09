import { createContext, useEffect, useState } from "react";
import { storage } from "../services/storage";
import { userService } from "../services/userService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedUser = storage.getUser();
        const accessToken = storage.getAccessToken();

        if (savedUser && accessToken) {
          setUser(savedUser);

          try {
            const profileResponse = await userService.getProfile();
            const profileUser = profileResponse.data?.data;

            if (profileUser) {
              storage.setSession({ user: profileUser });
              setUser(profileUser);
            }
          } catch {
            // Session fallback stays on the locally cached user.
          }
        } else {
          storage.clearSession();
        }
      } catch {
        storage.clearSession();
        setError("Unable to restore your session");
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = (session) => {
    storage.setSession(session);
    setUser(session.user);
    setError("");
  };

  const logout = () => {
    storage.clearSession();
    setUser(null);
    setError("");
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  };

  const updateUser = (nextUser) => {
    const mergedUser = { ...user, ...nextUser };
    storage.setSession({ user: mergedUser });
    setUser(mergedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: Boolean(user),
        login,
        logout,
        updateUser,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
