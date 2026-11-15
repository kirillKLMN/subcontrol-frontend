import { apiRequest } from "./client";

import { toSubscription } from "./adapters/subscriptions";
import type { Subscription } from "../data";


import type {
  ApiSubscription,
  ApiSubscriptionCreate,
  ApiSubscriptionPatch,
} from "../types/api";

// Получить все подписки
export function getSubscriptions(): Promise<ApiSubscription[]> {
  return apiRequest<ApiSubscription[]>("/api/subscriptions");
}

// Создать подписку
export function createSubscription(
  data: ApiSubscriptionCreate,
): Promise<ApiSubscription> {
  return apiRequest<ApiSubscription>("/api/subscriptions", {
    method: "POST",
    body: data,
  });
}

// Изменить существующую подписку
export function updateSubscription(
  id: number,
  data: ApiSubscriptionPatch,
): Promise<ApiSubscription> {
  return apiRequest<ApiSubscription>(
    `/api/subscriptions/${id}`,
    {
      method: "PATCH",
      body: data,
    },
  );
}


export async function getSubscriptionsForUi(): Promise<Subscription[]> {
  const apiSubscriptions = await getSubscriptions();

  return apiSubscriptions.map(toSubscription);
}
