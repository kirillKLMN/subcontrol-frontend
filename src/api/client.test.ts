import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { apiRequest } from "./client";

describe("apiRequest", () => {
  let stored: Map<string, string>;

  beforeEach(() => {
    stored = new Map();

    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: (key: string) => stored.get(key) ?? null,
        setItem: (key: string, value: string) =>
          stored.set(key, value),
        removeItem: (key: string) => stored.delete(key),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("передаёт JWT-токен в защищённых запросах", async () => {
    stored.set("subcontrol.accessToken", "test-token");

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("/api/auth/me");

    const options = fetchMock.mock.calls[0][1] as RequestInit;

    expect(
      new Headers(options.headers).get("Authorization"),
    ).toBe("Bearer test-token");
  });

  it("не отправляет JWT в публичных запросах", async () => {
    stored.set("subcontrol.accessToken", "test-token");

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("/api/auth/login", {
      method: "POST",
      body: {
        email: "test@example.com",
        password: "password123",
      },
      auth: false,
    });

    const options = fetchMock.mock.calls[0][1] as RequestInit;

    expect(
      new Headers(options.headers).has("Authorization"),
    ).toBe(false);
  });

  it("удаляет токен после ошибки 401", async () => {
    stored.set("subcontrol.accessToken", "expired-token");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ detail: "Требуется войти" }),
          { status: 401 },
        ),
      ),
    );

    await expect(
      apiRequest("/api/subscriptions"),
    ).rejects.toMatchObject({
      status: 401,
      message: "Требуется войти",
    });

    expect(
      stored.has("subcontrol.accessToken"),
    ).toBe(false);
  });
});