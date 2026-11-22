import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getCurrentRenewalDecisions,
  toApiRenewalDecision,
  toStoredRenewalDecisions,
} from "./renewalDecisions";

import type {
  StoredRenewalDecisions,
} from "./renewalDecisions";

import type {
  Subscription,
} from "../data";
import type { ApiRenewalDecision } from "../types/api";

const subscription: Subscription = {
  id: 5,
  name: "Figma",
  vendor: "Figma",
  tariff: "Professional",
  price: 12000,
  currency: "RUB",
  renewal: "2026-12-01",
  paySource: "corp-1",
  owner: "Анна Смирнова",
  status: "Активна",
};

const storedDecisions: StoredRenewalDecisions = {
  "5": {
    renewalDate: "2026-12-01",
    decision: "Подготовить продление",
    comment: "Продлеваем подписку",
  },
};

describe("getCurrentRenewalDecisions", () => {
  it("сохраняет решение для актуальной подписки", () => {
    const result = getCurrentRenewalDecisions(
      storedDecisions,
      [subscription],
    );

    expect(result).toEqual(storedDecisions);
  });

  it("удаляет устаревшее решение при изменении даты продления", () => {
    const updatedSubscription: Subscription = {
      ...subscription,
      renewal: "2027-01-01",
    };

    const result = getCurrentRenewalDecisions(
      storedDecisions,
      [updatedSubscription],
    );

    expect(result).toEqual({});
  });

  it("не возвращает решения для отменённой подписки", () => {
    const cancelledSubscription: Subscription = {
      ...subscription,
      status: "Отменена",
    };

    const result = getCurrentRenewalDecisions(
      storedDecisions,
      [cancelledSubscription],
    );

    expect(result).toEqual({});
  });

  it("не возвращает решения для отсутствующих подписок", () => {
    const result = getCurrentRenewalDecisions(
      storedDecisions,
      [],
    );

    expect(result).toEqual({});
  });
});

describe("renewal decisions API adapter", () => {
  const firstAction: ApiRenewalDecision = {
    id: 10,
    subscription_id: 5,
    renewal_date: "2026-12-01",
    decision: "prepare_renewal",
    comment: "Первое решение",
    decided_by_user_id: 1,
    created_at: "2026-11-20T10:00:00Z",
  };

  it("преобразует все три варианта решения для API", () => {
    expect(toApiRenewalDecision("Подготовить продление")).toBe(
      "prepare_renewal",
    );
    expect(toApiRenewalDecision("Подготовить отмену")).toBe(
      "prepare_cancel",
    );
    expect(toApiRenewalDecision("Запрошено уточнение")).toBe(
      "needs_info",
    );
  });

  it("берёт последнее решение для подписки независимо от порядка ответа", () => {
    const latestAction: ApiRenewalDecision = {
      ...firstAction,
      id: 11,
      decision: "needs_info",
      comment: "Уточнить потребность",
      created_at: "2026-11-21T10:00:00Z",
    };

    const result = toStoredRenewalDecisions([
      firstAction,
      latestAction,
    ]);

    expect(result).toEqual({
      "5": {
        renewalDate: "2026-12-01",
        decision: "Запрошено уточнение",
        comment: "Уточнить потребность",
      },
    });
  });

  it("не показывает старое решение после изменения даты продления", () => {
    const stored = toStoredRenewalDecisions([firstAction]);

    expect(getCurrentRenewalDecisions(stored, [
      { ...subscription, renewal: "2027-01-01" },
    ])).toEqual({});
  });
});
