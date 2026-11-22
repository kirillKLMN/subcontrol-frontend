import { apiRequest } from "./client";

import type {
  ApiRenewalDecision,
  ApiRenewalDecisionCreate,
} from "../types/api";

export function getRenewalDecisions(): Promise<ApiRenewalDecision[]> {
  return apiRequest<ApiRenewalDecision[]>("/api/renewal-decisions");
}

export function createRenewalDecision(
  data: ApiRenewalDecisionCreate,
): Promise<ApiRenewalDecision> {
  return apiRequest<ApiRenewalDecision>("/api/renewal-decisions", {
    method: "POST",
    body: data,
  });
}
