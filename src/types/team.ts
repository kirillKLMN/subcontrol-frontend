import type { AuthOrganization, AuthUser, UserRole } from "./auth";

export type TeamMember = {
  membership_id: number;
  user: AuthUser;
  roles: UserRole[];
  is_active: boolean;
  assigned_services: string[];
};

export type TeamInvitation = {
  id: number;
  email: string;
  full_name: string;
  roles: UserRole[];
  expires_at: string;
  invite_url?: string | null;
};

export type TeamInvitationCreate = {
  email: string;
  full_name: string;
  roles: Exclude<UserRole, "owner">[];
};

export type TeamMemberPatch = {
  roles?: Exclude<UserRole, "owner">[];
  is_active?: boolean;
};

export type DefaultApproverUpdate = Pick<
  AuthOrganization,
  "default_approver_user_id" | "id" | "name"
>;
