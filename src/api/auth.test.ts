import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  changeUserPassword,
  login,
  logout,
  updateUserProfile,
} from "./auth";

describe("auth API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("сохраняет JWT после входа и удаляет при выходе", async () => {
    const stored = new Map<string, string>();

    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: (key: string) => stored.get(key) ?? null,
        setItem: (key: string, value: string) =>
          stored.set(key, value),
        removeItem: (key: string) =>
          stored.delete(key),
      },
    });

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "test-jwt",
          token_type: "bearer",
          user: {
            id: 1,
            email: "kirill@example.com",
            full_name: "Кирилл",
          },
          organization: {
            id: 1,
            name: "SubControl",
            default_approver_user_id: 1,
          },
          roles: ["owner"],
        }),
        { status: 200 },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    const response = await login({
      email: "kirill@example.com",
      password: "password123",
    });

    expect(response.user.full_name).toBe("Кирилл");

    expect(
      stored.get("subcontrol.accessToken"),
    ).toBe("test-jwt");

    const options = fetchMock.mock.calls[0][1] as RequestInit;

    expect(
      new Headers(options.headers).has("Authorization"),
    ).toBe(false);

    logout();

    expect(
      stored.has("subcontrol.accessToken"),
    ).toBe(false);
  });

  it("обновляет имя через PATCH /api/auth/me с авторизацией", async () => {
    const stored = new Map([["subcontrol.accessToken", "test-jwt"]]);
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: (key: string) => stored.get(key) ?? null,
        setItem: (key: string, value: string) => stored.set(key, value),
        removeItem: (key: string) => stored.delete(key),
      },
    });

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        id: 1,
        email: "kirill@example.com",
        full_name: "Кирилл Новый",
      }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const user = await updateUserProfile({ full_name: "Кирилл Новый" });
    expect(user.full_name).toBe("Кирилл Новый");

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/auth/me");
    expect(options.method).toBe("PATCH");
    expect(JSON.parse(options.body as string)).toEqual({ full_name: "Кирилл Новый" });
    expect(new Headers(options.headers).get("Authorization")).toBe("Bearer test-jwt");
  });

  it("обрабатывает 204 после смены пароля", async () => {
    const stored = new Map([["subcontrol.accessToken", "test-jwt"]]);
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: (key: string) => stored.get(key) ?? null,
        setItem: (key: string, value: string) => stored.set(key, value),
        removeItem: (key: string) => stored.delete(key),
      },
    });
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(changeUserPassword({
      current_password: "old-password",
      new_password: "new-password",
    })).resolves.toBeUndefined();

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/auth/password");
    expect(options.method).toBe("PATCH");
    expect(JSON.parse(options.body as string)).toEqual({
      current_password: "old-password",
      new_password: "new-password",
    });
  });
});
