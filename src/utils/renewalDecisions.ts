import type { Subscription } from "../data";
import type {
  ApiRenewalDecision,
  ApiRenewalDecisionValue,
} from "../types/api";

export type RenewalDecisionValue =
  | "Подготовить продление"
  | "Подготовить отмену"
  | "Запрошено уточнение";

export type StoredRenewalDecision = {
  renewalDate: string;
  decision: RenewalDecisionValue;
  comment: string;
};

export type StoredRenewalDecisions = Record<
  string,
  StoredRenewalDecision
>;

const apiToUi: Record<ApiRenewalDecisionValue, RenewalDecisionValue> = {
  prepare_renewal: "Подготовить продление",
  prepare_cancel: "Подготовить отмену",
  needs_info: "Запрошено уточнение",
};

const uiToApi: Record<RenewalDecisionValue, ApiRenewalDecisionValue> = {
  "Подготовить продление": "prepare_renewal",
  "Подготовить отмену": "prepare_cancel",
  "Запрошено уточнение": "needs_info",
};

export function toApiRenewalDecision(
  decision: RenewalDecisionValue,
): ApiRenewalDecisionValue {
  return uiToApi[decision];
}

export function toStoredRenewalDecision(
  action: ApiRenewalDecision,
): StoredRenewalDecision {
  return {
    renewalDate: action.renewal_date,
    decision: apiToUi[action.decision],
    comment: action.comment,
  };
}

export function toStoredRenewalDecisions(
  actions: ApiRenewalDecision[],
): StoredRenewalDecisions {
  const result: StoredRenewalDecisions = {};

  // API хранит историю: для подписки показываем последнее решение.
  const newestFirst = [...actions].sort(
    (first, second) =>
      second.created_at.localeCompare(first.created_at) ||
      second.id - first.id,
  );

  for (const action of newestFirst) {
    const key = String(action.subscription_id);

    if (!(key in result)) {
      result[key] = toStoredRenewalDecision(action);
    }
  }

  return result;
}

export function getCurrentRenewalDecisions(
  stored: StoredRenewalDecisions,
  subscriptions: Subscription[],
): StoredRenewalDecisions {
  const result: StoredRenewalDecisions = {};

  for (const subscription of subscriptions) {
    const saved = stored[String(subscription.id)];

    if (
      saved &&
      subscription.renewal &&
      subscription.status !== "Отменена" &&
      saved.renewalDate === subscription.renewal
    ) {
      result[String(subscription.id)] = saved;
    }
  }

  return result;
}
