import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { PropsWithChildren } from "react";

import {
  acceptInvitation,
  getCurrentUser,
  login,
  logout,
  register,
} from "../api/auth";

import {
  getAccessToken,
  onSessionCleared,
} from "../api/session";

import type {
  AuthResponse,
  CurrentUser,
} from "../types/auth";

import {
  AuthContext,
  type AuthContextValue,
} from "./AuthContext";

type AuthSnapshot = Pick<
  AuthContextValue,
  "status" | "currentUser" | "error"
>;

const anonymous: AuthSnapshot = {
  status: "anonymous",
  currentUser: null,
  error: null,
};

const loading: AuthSnapshot = {
  status: "loading",
  currentUser: null,
  error: null,
};

export function AuthProvider({
  children,
}: PropsWithChildren) {
  const [auth, setAuth] = useState<AuthSnapshot>(
    () => getAccessToken() ? loading : anonymous,
  );

  const requestId = useRef(0);

  const restoreSession = useCallback(async (token: string) => {
  const currentRequest = ++requestId.current;

  try {
    const currentUser = await getCurrentUser();

    if (
      currentRequest === requestId.current &&
      getAccessToken() === token
    ) {
      setAuth({
        status: "authenticated",
        currentUser,
        error: null,
      });
    }
  } catch (error) {
    if (currentRequest !== requestId.current) {
      return;
    }

    if (getAccessToken() !== token) {
      return;
    }

    setAuth({
      status: "error",
      currentUser: null,
      error:
        error instanceof Error
          ? error.message
          : "Не удалось проверить сессию",
    });
  }
}, []);

  useEffect(() => {
    const unsubscribe = onSessionCleared(() => {
        requestId.current += 1;
        setAuth(anonymous);
    });

    const token = getAccessToken();

    if (token) {
        const currentRequest = ++requestId.current;

        void getCurrentUser()
        .then((currentUser) => {
            if (
            currentRequest === requestId.current &&
            getAccessToken() === token
            ) {
            setAuth({
                status: "authenticated",
                currentUser,
                error: null,
            });
            }
        })
        .catch((error: unknown) => {
            if (
            currentRequest !== requestId.current ||
            getAccessToken() !== token
            ) {
            return;
            }

            setAuth({
            status: "error",
            currentUser: null,
            error:
                error instanceof Error
                ? error.message
                : "Не удалось проверить сессию",
            });
        });
    }

    return () => {
        unsubscribe();
        requestId.current += 1;
    };
    }, []);

  const applyAuthResponse = (response: AuthResponse) => {
    requestId.current += 1;

    const currentUser: CurrentUser = {
      user: response.user,
      organization: response.organization,
      roles: response.roles,
    };

    setAuth({
      status: "authenticated",
      currentUser,
      error: null,
    });
  };

  const value: AuthContextValue = {
    ...auth,

    signIn: async (data) =>
      applyAuthResponse(await login(data)),

    signUp: async (data) =>
      applyAuthResponse(await register(data)),

    acceptInvite: async (data) =>
      applyAuthResponse(await acceptInvitation(data)),

    signOut: () => logout(),

    retry: async () => {
    const token = getAccessToken();

    if (!token) {
        setAuth(anonymous);
        return;
    }

    setAuth(loading);

    await restoreSession(token);
    },
    };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}