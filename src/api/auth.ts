import { apiRequest } from "./client";
import {
  clearAccessToken,
  saveAccessToken,
} from "./session";

import type {
  AcceptInvitationInput,
  AuthUser,
  AuthResponse,
  CurrentUser,
  LoginInput,
  PasswordChangeInput,
  ProfileUpdateInput,
  RegisterInput,
} from "../types/auth";

async function authorize(
  endpoint: string,
  data: LoginInput | RegisterInput | AcceptInvitationInput,
): Promise<AuthResponse> {
  const result = await apiRequest<AuthResponse>(endpoint, {
    method: "POST",
    body: data,
    auth: false,
  });

  saveAccessToken(result.access_token);

  return result;
}

export function login(data: LoginInput): Promise<AuthResponse> {
  return authorize("/api/auth/login", data);
}

export function register(data: RegisterInput): Promise<AuthResponse> {
  return authorize("/api/auth/register", data);
}

export function acceptInvitation(
  data: AcceptInvitationInput,
): Promise<AuthResponse> {
  return authorize("/api/auth/accept-invitation", data);
}

export function getCurrentUser(): Promise<CurrentUser> {
  return apiRequest<CurrentUser>("/api/auth/me");
}

export function updateUserProfile(data: ProfileUpdateInput): Promise<AuthUser> {
  return apiRequest<AuthUser>("/api/auth/me", {
    method: "PATCH",
    body: data,
  });
}

export function changeUserPassword(data: PasswordChangeInput): Promise<void> {
  return apiRequest<void>("/api/auth/password", {
    method: "PATCH",
    body: data,
  });
}

export function logout(): void {
  clearAccessToken();
}
