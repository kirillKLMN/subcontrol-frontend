import { apiRequest } from "./client";

export type ApiApproval = {
  id: number;
  service_name: string;
  tariff: string | null;
  price_month: string;
  reason: string | null;
  link: string | null;
  status: string;
  comment: string | null;
};

export type ApiApprovalCreate = {
  service_name: string;
  tariff?: string | null;
  price_month?: string;
  reason?: string | null;
  link?: string | null;
};

export type ApiApprovalDecision = {
  decision: "approved" | "rejected" | "needs_info";
  comment?: string | null;
};

export function getApprovals(
  status?: string,
): Promise<ApiApproval[]> {
  const query = status
    ? `?status=${encodeURIComponent(status)}`
    : "";

  return apiRequest<ApiApproval[]>(
    `/api/approvals${query}`,
  );
}

export function createApproval(
  data: ApiApprovalCreate,
): Promise<ApiApproval> {
  return apiRequest<ApiApproval>(
    "/api/approvals",
    {
      method: "POST",
      body: data,
    },
  );
}

export function decideApproval(
  id: number,
  data: ApiApprovalDecision,
): Promise<ApiApproval> {
  return apiRequest<ApiApproval>(
    `/api/approvals/${id}/decision`,
    {
      method: "POST",
      body: data,
    },
  );
}
