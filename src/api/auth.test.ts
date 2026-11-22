import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { login, logout } from "./auth";

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
});