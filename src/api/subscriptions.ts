import { apiRequest } from "./client";

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
