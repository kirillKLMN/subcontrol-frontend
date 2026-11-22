import { describe, expect, it } from "vitest";
import { formatUserRoles } from "./userRoles";

describe("formatUserRoles", () => {
  it("отображает владельца организации", () => {
    expect(formatUserRoles(["owner"])).toBe("Владелец");
  });

  it("объединяет несколько ролей", () => {
    expect(formatUserRoles(["coordinator", "approver"]))
      .toBe("Координатор, Согласующий");
  });

  it("показывает понятный текст при отсутствии ролей", () => {
    expect(formatUserRoles([])).toBe("Участник");
  });
});
