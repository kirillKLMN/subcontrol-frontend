import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  createTeamInvitation,
  getTeamInvitations,
  getTeamMembers,
  refreshInvitationLink,
  setDefaultApprover,
  updateTeamMember,
} from "./team";

describe("team API", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("запрашивает сотрудников текущей организации", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getTeamMembers()).resolves.toEqual([]);
    expect(fetchMock.mock.calls[0][0]).toContain("/api/team/members");
  });

  it("передаёт email и выбранные роли при приглашении", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 3 }), { status: 201 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await createTeamInvitation({
      email: "staff@example.com",
      full_name: "Новый сотрудник",
      roles: ["requester", "approver"],
    });

    const options = fetchMock.mock.calls[0][1] as RequestInit;
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body as string)).toEqual({
      email: "staff@example.com",
      full_name: "Новый сотрудник",
      roles: ["requester", "approver"],
    });
  });

  it("сообщает об отказе в доступе к приглашениям", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ detail: "Недостаточно прав" }),
        { status: 403 },
      ),
    ));

    await expect(getTeamInvitations()).rejects.toMatchObject({
      status: 403,
      message: "Недостаточно прав",
    });
  });

  it("обновляет роли по membership_id, а не user.id", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ membership_id: 12 }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await updateTeamMember(12, { roles: ["coordinator"] });

    expect(fetchMock.mock.calls[0][0]).toContain("/api/team/members/12");
    const options = fetchMock.mock.calls[0][1] as RequestInit;
    expect(options.method).toBe("PATCH");
  });

  it("перевыпускает ссылку и назначает согласующего", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 8 }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 1,
            name: "Test Organization",
            default_approver_user_id: 5,
          }),
          { status: 200 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    await refreshInvitationLink(8);
    await setDefaultApprover(5);

    expect(fetchMock.mock.calls[0][0]).toContain(
      "/api/team/invitations/8/resend",
    );
    expect(fetchMock.mock.calls[1][0]).toContain(
      "/api/team/default-approver",
    );
    const options = fetchMock.mock.calls[1][1] as RequestInit;
    expect(JSON.parse(options.body as string)).toEqual({ user_id: 5 });
  });
});
