export type UserRole =
  | "owner"
  | "coordinator"
  | "approver"
  | "requester";

export type AuthUser = {
  id: number;
  email: string;
  full_name: string;
};

export type AuthOrganization = {
  id: number;
  name: string;
  default_approver_user_id: number | null;
};

export type CurrentUser = {
  user: AuthUser;
  organization: AuthOrganization;
  roles: UserRole[];
};

export type AuthResponse = CurrentUser & {
  access_token: string;
  token_type: "bearer";
};

export type RegisterInput = {
  organization_name: string;
  full_name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AcceptInvitationInput = {
  token: string;
  password: string;
};