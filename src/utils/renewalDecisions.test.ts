import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getCurrentRenewalDecisions,
} from "./renewalDecisions";

import type {
  StoredRenewalDecisions,
} from "./renewalDecisions";

import type {
  Subscription,
} from "../data";

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