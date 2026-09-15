import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentUserRequest,
  loginRequest,
  registerRequest,
} from "@/features/auth/api/authApi";

import {
  AuthContext,
} from "@/features/auth/context/AuthContext";

import {
  queryClient,
} from "@/lib/queryClient";

import {
  AUTH_UNAUTHORIZED_EVENT,
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/lib/authToken";


export default function AuthProvider({
  children,
}) {
  const [
    user,
    setUser,
  ] = useState(null);

  const [
    initializing,
    setInitializing,
  ] = useState(true);


  const logout = useCallback(() => {
    clearAccessToken();

    setUser(null);

    queryClient.clear();
  }, []);


  useEffect(() => {
    function handleUnauthorized() {
      logout();
    }

    window.addEventListener(
      AUTH_UNAUTHORIZED_EVENT,
      handleUnauthorized
    );

    return () => {
      window.removeEventListener(
        AUTH_UNAUTHORIZED_EVENT,
        handleUnauthorized
      );
    };
  }, [logout]);


  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token =
        getAccessToken();

      if (!token) {
        setInitializing(false);
        return;
      }

      try {
        const currentUser =
          await getCurrentUserRequest();

        if (!cancelled) {
          setUser(currentUser);
        }
      } catch {
        clearAccessToken();

        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);


  async function login(credentials) {
    const tokenData =
      await loginRequest(
        credentials
      );

    setAccessToken(
      tokenData.access_token
    );

    try {
      const currentUser =
        await getCurrentUserRequest();

      setUser(currentUser);

      return currentUser;
    } catch (error) {
      clearAccessToken();
      setUser(null);

      throw error;
    }
  }


  async function register(payload) {
    return registerRequest(
      payload
    );
  }


  const value = useMemo(
    () => ({
      user,

      initializing,

      isAuthenticated:
        Boolean(user),

      login,

      register,

      logout,
    }),
    [
      user,
      initializing,
      logout,
    ]
  );


  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}