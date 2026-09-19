/**
 * AgroCare AI — Authentication context
 * Wraps AWS Amplify v6 auth into a React context.
 * Provides: user, isLoading, isAuthenticated, signOut
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getCurrentUser,
  signOut as amplifySignOut,
  type AuthUser,
} from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemo: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loginAsDemo: () => void;
}

const DEMO_USER: AuthUser = {
  username: "Ramesh Kumar",
  userId: "demo-farmer-001",
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (localStorage.getItem("agro_demo_mode") === "true") {
      setUser(DEMO_USER);
      setIsDemo(true);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsDemo(false);
    } catch {
      setUser(null);
      setIsDemo(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAsDemo = useCallback(() => {
    localStorage.setItem("agro_demo_mode", "true");
    setUser(DEMO_USER);
    setIsDemo(true);
  }, []);

  useEffect(() => {
    loadUser();

    // Listen for auth events (sign-in, sign-out, token refresh)
    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      switch (payload.event) {
        case "signedIn":
          localStorage.removeItem("agro_demo_mode");
          setIsDemo(false);
          loadUser();
          break;
        case "signedOut":
          localStorage.removeItem("agro_demo_mode");
          setUser(null);
          setIsDemo(false);
          break;
        case "tokenRefresh":
          loadUser();
          break;
        case "tokenRefresh_failure":
          setUser(null);
          break;
      }
    });

    return () => unsubscribe();
  }, [loadUser]);

  const signOut = useCallback(async () => {
    localStorage.removeItem("agro_demo_mode");
    try {
      await amplifySignOut();
    } catch {
      // ignore
    }
    setUser(null);
    setIsDemo(false);
  }, []);

  const refreshUser = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isDemo,
        signOut,
        refreshUser,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
