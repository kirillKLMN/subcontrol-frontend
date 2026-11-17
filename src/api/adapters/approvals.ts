import type { Approval } from "../../data";
import type { ApiApproval } from "../approvals";

export function toApproval(
  apiApproval: ApiApproval,
): Approval {
  const price = Number(apiApproval.price_month);

  if (!Number.isFinite(price)) {
    throw new Error(
      `Некорректная стоимость заявки #${apiApproval.id}`,
    );
  }

  return {
    id: apiApproval.id,
    name: apiApproval.service_name,
    tariff: apiApproval.tariff ?? "Не указан",
    price,
    goal: apiApproval.reason ?? "Не указано",
    url: apiApproval.link ?? "",
    status: apiApproval.status,
    comment: apiApproval.comment ?? "",
    author: "Не указан",
  };
}

export function toApprovals(
  apiApprovals: ApiApproval[],
): Approval[] {
  return apiApprovals.map(toApproval);
}
