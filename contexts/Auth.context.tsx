import { api, auth } from "@/utils";
import { useRouter } from "next/router";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextInterface {
  registerToken: string | null;
  setRegisterToken: (token: string | null) => void;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  user: Record<string, any> | null;
  setUser: (user: Record<string, any> | null) => void;
}

const AuthContext = createContext<AuthContextInterface | undefined>(undefined);

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [registerToken, setRegisterToken] = useState<string | null>(null);
  const [user, setUser] = useState<Record<string, any> | null>(null);
  const router = useRouter();
  const set_access_token = (token: string | null) => {
    setAccessToken(token);

    if (token) {
      auth.setAccessToken(token)
    } else {
      auth.deleteAccessToken()
    }
  }

  const fetchUser = async () => {
    try {
      const fetch = await api({ path: "me" });
      
      if (fetch?.status === 200 && fetch?.data) {
        setUser(fetch?.data);
        return true;
      } else if (fetch?.status === 401) {
        // Token is invalid, clear auth and redirect
        console.log('401 Unauthorized - clearing auth and redirecting to login');
        auth.deleteAccessToken();
        setAccessToken(null);
        setUser(null);
        router.push('/login');
        return false;
      }
    } catch (error: any) {
      // On error, clear auth and redirect to login
      console.log('Error fetching user - clearing auth:', error?.message || error);
      auth.deleteAccessToken();
      setAccessToken(null);
      setUser(null);
      if (!router.pathname.includes('login') && !router.pathname.includes('register')) {
        router.push('/login');
      }
      return false;
    }
  }

  useEffect(() => {
    const token = auth.getAccessToken() || null;
    setAccessToken(token);

    // Only fetch user on initial mount if we have token but no user
    // Don't fetch on route changes to avoid race conditions
    if (token && !user && !router.pathname.includes('login') && !router.pathname.includes('register')) {
      fetchUser();
    }
  }, []); // Empty dependency array - only run once on mount

  return (
    <AuthContext.Provider value={{
      registerToken,
      setRegisterToken,
      accessToken,
      setAccessToken: (token) => set_access_token(token),
      user,
      setUser,
    }}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextInterface => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within a AuthContext.Provider");
  }
  return context;
};
