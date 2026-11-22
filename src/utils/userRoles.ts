import type { UserRole } from "../types/auth";

const roleLabels: Record<UserRole, string> = {
  owner: "Владелец",
  coordinator: "Координатор",
  approver: "Согласующий",
  requester: "Инициатор заявки",
};

export function formatUserRoles(roles: UserRole[]): string {
  if (roles.includes("owner")) {
    return roleLabels.owner;
  }

  return roles.map((role) => roleLabels[role]).join(", ") || "Участник";
}
