import type { Subscription } from "../../data";

import type {
  ApiSubscription,
  ApiSubscriptionCreate,
  ApiSubscriptionPatch,
} from "../../types/api";



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


export function toApiSubscriptionCreate(
  subscription: Subscription,
): ApiSubscriptionCreate {
  const statusMap: Record<string, string> = {
    Активна: "active",
    Trial: "trial",
    Отменена: "cancelled",
  };

  const status = statusMap[subscription.status];

  if (!status) {
    throw new Error("Неизвестный статус подписки");
  }

  if (
    !Number.isFinite(subscription.price) ||
    subscription.price < 0
  ) {
    throw new Error("Некорректная стоимость подписки");
  }

  return {
    name: subscription.name.trim(),
    vendor: subscription.vendor,
    tariff: subscription.tariff,
    price_month: String(subscription.price),
    currency: subscription.currency,
    renewal_date: subscription.renewal || null,
    pay_source: subscription.paySource,
    owner: subscription.owner,
    status,
  };
}


export function toApiSubscriptionPatch(
  subscription: Subscription,
): ApiSubscriptionPatch {
  const data = toApiSubscriptionCreate(subscription);

  return {
    vendor: data.vendor === "Не указан" ? null : data.vendor,
    tariff: data.tariff === "Не указан" ? null : data.tariff,
    price_month: data.price_month,
    renewal_date: data.renewal_date,
    pay_source:
      data.pay_source === "Не указан" ? null : data.pay_source,
    owner: data.owner === "Не указан" ? null : data.owner,
    status: data.status,
  };
}

