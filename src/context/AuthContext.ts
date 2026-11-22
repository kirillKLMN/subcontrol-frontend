import { createContext } from "react";

import type {
  AcceptInvitationInput,
  CurrentUser,
  LoginInput,
  RegisterInput,
} from "../types/auth";

export type AuthStatus =
  | "loading"
  | "authenticated"
  | "anonymous"
  | "error";

export type AuthContextValue = {
  status: AuthStatus;
  currentUser: CurrentUser | null;
  error: string | null;

  signIn: (data: LoginInput) => Promise<void>;
  signUp: (data: RegisterInput) => Promise<void>;

  acceptInvite: (
    data: AcceptInvitationInput,
  ) => Promise<void>;

  signOut: () => void;
  retry: () => Promise<void>;
};

export const AuthContext =
  createContext<AuthContextValue | null>(null);