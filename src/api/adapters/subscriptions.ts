import type { Subscription } from "../../data";
import type { ApiSubscription } from "../../types/api";

function toUiStatus(status: string): string {
  switch (status) {
    case "active":
      return "Активна";
    case "trial":
      return "Trial";
    case "cancelled":
      return "Отменена";
    default:
      return status;
  }
}

export function toSubscription(
  data: ApiSubscription,
): Subscription {
  const price = Number(data.price_month);

  if (!Number.isFinite(price)) {
    throw new Error(
      `Некорректная стоимость подписки: ${data.id}`,
    );
  }

  return {
    id: data.id,
    name: data.name,
    vendor: data.vendor ?? "Не указан",
    tariff: data.tariff ?? "Не указан",
    price,
    currency: data.currency,
    renewal: data.renewal_date ?? "",
    owner: data.owner ?? "Не указан",
    status: toUiStatus(data.status),
    paySource: data.pay_source ?? "Не указан",
  };
}
