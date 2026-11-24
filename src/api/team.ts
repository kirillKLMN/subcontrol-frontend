import { apiRequest } from "./client";

import type {
  DefaultApproverUpdate,
  TeamInvitation,
  TeamInvitationCreate,
  TeamMember,
  TeamMemberPatch,
} from "../types/team";

export function getTeamMembers(): Promise<TeamMember[]> {
  return apiRequest<TeamMember[]>("/api/team/members");
}

export function getTeamInvitations(): Promise<TeamInvitation[]> {
  return apiRequest<TeamInvitation[]>("/api/team/invitations");
}

export function createTeamInvitation(
  data: TeamInvitationCreate,
): Promise<TeamInvitation> {
  return apiRequest<TeamInvitation>("/api/team/invitations", {
    method: "POST",
    body: data,
  });
}

export function refreshInvitationLink(
  invitationId: number,
): Promise<TeamInvitation> {
  return apiRequest<TeamInvitation>(
    `/api/team/invitations/${invitationId}/resend`,
    { method: "POST" },
  );
}

export function updateTeamMember(
  membershipId: number,
  data: TeamMemberPatch,
): Promise<TeamMember> {
  return apiRequest<TeamMember>(
    `/api/team/members/${membershipId}`,
    { method: "PATCH", body: data },
  );
}

export function setDefaultApprover(
  userId: number,
): Promise<DefaultApproverUpdate> {
  return apiRequest<DefaultApproverUpdate>(
    "/api/team/default-approver",
    { method: "PATCH", body: { user_id: userId } },
  );
}
