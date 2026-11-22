import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  createRenewalDecision,
  getRenewalDecisions,
} from "./renewalDecisions";

describe("renewal decisions API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("получает решения текущего рабочего пространства", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    vi.stubGlobal("fetch", fetchMock);

    await expect(getRenewalDecisions()).resolves.toEqual([]);

    const [url, options] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ];

    expect(url).toContain("/api/renewal-decisions");
    expect(options.method).toBeUndefined();
  });

  it("отправляет дату, подписку и выбранное решение", async () => {
    const action = {
      id: 20,
      subscription_id: 5,
      renewal_date: "2026-12-01",
      decision: "prepare_cancel" as const,
      comment: "Отказываемся от сервиса",
      decided_by_user_id: 1,
      created_at: "2026-11-22T10:00:00Z",
    };

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(action), { status: 201 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(createRenewalDecision({
      subscription_id: 5,
      renewal_date: "2026-12-01",
      decision: "prepare_cancel",
      comment: "Отказываемся от сервиса",
    })).resolves.toEqual(action);

    const [, options] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ];

    expect(options.method).toBe("POST");
    expect(new Headers(options.headers).get("Content-Type")).toBe(
      "application/json",
    );
    expect(JSON.parse(options.body as string)).toEqual({
      subscription_id: 5,
      renewal_date: "2026-12-01",
      decision: "prepare_cancel",
      comment: "Отказываемся от сервиса",
    });
  });

  it("передаёт сообщение сервера при изменившейся дате продления", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          detail: "Дата продления изменилась. Обновите страницу и проверьте срок.",
        }),
        { status: 409 },
      ),
    ));

    await expect(createRenewalDecision({
      subscription_id: 5,
      renewal_date: "2026-12-01",
      decision: "prepare_renewal",
      comment: "",
    })).rejects.toMatchObject({
      status: 409,
      message: "Дата продления изменилась. Обновите страницу и проверьте срок.",
    });
  });
});
