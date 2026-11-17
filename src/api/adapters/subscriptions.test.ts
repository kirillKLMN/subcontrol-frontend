import {
  describe,
  expect,
  it,
} from "vitest";

import {
  toSubscription,
  toApiSubscriptionCreate,
  toApiSubscriptionPatch,
} from "./subscriptions";

import type {
  ApiSubscription,
} from "../../types/api";

import type {
  Subscription,
} from "../../data";

const apiSubscription: ApiSubscription = {
  id: 5,
  name: "Atlassian",
  vendor: null,
  tariff: null,
  price_month: "1500.00",
  currency: "RUB",
  renewal_date: null,
  pay_source: null,
  owner: null,
  status: "active",
};

const subscription: Subscription = {
  id: 5,
  name: " Figma ",
  vendor: "Figma",
  tariff: "Professional",
  price: 12000,
  currency: "RUB",
  renewal: "2026-12-01",
  paySource: "corp-1",
  owner: "Анна Смирнова",
  status: "Активна",
};

describe("toSubscription", () => {
  it("преобразует ответ API в модель интерфейса", () => {
    const result = toSubscription(apiSubscription);

    expect(result).toEqual({
      id: 5,
      name: "Atlassian",
      vendor: "Не указан",
      tariff: "Не указан",
      price: 1500,
      currency: "RUB",
      renewal: "",
      paySource: "Не указан",
      owner: "Не указан",
      status: "Активна",
    });
  });

  it("отклоняет некорректную стоимость", () => {
    const invalidSubscription: ApiSubscription = {
      ...apiSubscription,
      price_month: "invalid",
    };

    expect(() =>
      toSubscription(invalidSubscription),
    ).toThrow();
  });
});

describe("toApiSubscriptionCreate", () => {
  it("подготавливает подписку для создания через API", () => {
    const result =
      toApiSubscriptionCreate(subscription);

    expect(result).toEqual({
      name: "Figma",
      vendor: "Figma",
      tariff: "Professional",
      price_month: "12000",
      currency: "RUB",
      renewal_date: "2026-12-01",
      pay_source: "corp-1",
      owner: "Анна Смирнова",
      status: "active",
    });
  });
});

describe("toApiSubscriptionPatch", () => {
  it("преобразует отсутствующие значения в null", () => {
    const result = toApiSubscriptionPatch({
      ...subscription,
      vendor: "Не указан",
      tariff: "Не указан",
      owner: "Не указан",
      paySource: "Не указан",
    });

    expect(result).toMatchObject({
      vendor: null,
      tariff: null,
      owner: null,
      pay_source: null,
      status: "active",
    });
  });
});