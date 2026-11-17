import type { Subscription } from "../data";

const STORAGE_KEY = "subcontrol:renewal-decisions:v1";

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

const validDecisions = new Set<string>([
  "Подготовить продление",
  "Подготовить отмену",
  "Запрошено уточнение",
]);

export function loadRenewalDecisions(): StoredRenewalDecisions {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    const result: StoredRenewalDecisions = {};

    for (const [id, value] of Object.entries(parsed)) {
      if (
        !/^\d+$/.test(id) ||
        !value ||
        typeof value !== "object" ||
        Array.isArray(value)
      ) {
        continue;
      }

      const record = value as Record<string, unknown>;

      if (
        typeof record.renewalDate !== "string" ||
        typeof record.decision !== "string" ||
        !validDecisions.has(record.decision) ||
        typeof record.comment !== "string"
      ) {
        continue;
      }

      result[id] = {
        renewalDate: record.renewalDate,
        decision: record.decision as RenewalDecisionValue,
        comment: record.comment,
      };
    }

    return result;
  } catch {
    return {};
  }
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

export function saveRenewalDecisions(
  decisions: StoredRenewalDecisions,
): void {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(decisions),
  );
}
