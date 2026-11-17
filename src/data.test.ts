import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  daysLeft,
  dateLabel,
  money,
} from "./data";

describe("daysLeft", () => {
  beforeEach(() => {
    vi.useFakeTimers();

    vi.setSystemTime(
      new Date(2026, 10, 18, 12, 0, 0),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("возвращает 0 для сегодняшней даты", () => {
    expect(daysLeft("2026-11-18")).toBe(0);
  });

  it("правильно рассчитывает будущие даты", () => {
    expect(daysLeft("2026-11-19")).toBe(1);

    expect(daysLeft("2026-11-25")).toBe(7);
  });

  it("возвращает отрицательное число для прошедшей даты", () => {
    expect(daysLeft("2026-11-17")).toBe(-1);
  });

  it("обрабатывает отсутствующую дату", () => {
    expect(daysLeft("")).toBe(
      Number.POSITIVE_INFINITY,
    );
  });

  it("обрабатывает некорректную дату", () => {
    expect(daysLeft("invalid-date")).toBe(
      Number.POSITIVE_INFINITY,
    );
  });
});

describe("dateLabel", () => {
  it("форматирует дату на русском языке", () => {
    expect(dateLabel("2026-11-18")).toMatch(
      /18.*нояб/i,
    );
  });

  it("обрабатывает пустую дату", () => {
    expect(dateLabel("")).toBe("Не указана");
  });

  it("обрабатывает некорректную дату", () => {
    expect(dateLabel("invalid-date")).toBe(
      "Некорректная дата",
    );
  });
});

describe("money", () => {
  it("форматирует стоимость в рублях", () => {
    const result = money(12500, "RUB");

    expect(result).toContain("12");
    expect(result).toContain("500");
    expect(result).toContain("₽");
  });
});