import type { Checklist } from "../../data";

import type {
  ApiOffboardingChecklist,
} from "../offboarding";

export function toChecklist(
  apiChecklist: ApiOffboardingChecklist,
): Checklist {
  return {
    id: apiChecklist.id,
    employee: apiChecklist.employee,

    // Backend пока не возвращает должность.
    role: "—",

    closed: apiChecklist.status === "closed",

    items: apiChecklist.items.map((item) => ({
      id: item.id,
      name: item.service,
      revoked: item.access_revoked,
      returned: item.license_returned,
    })),
  };
}

export function toChecklists(
  apiChecklists: ApiOffboardingChecklist[],
): Checklist[] {
  return apiChecklists.map(toChecklist);
}
