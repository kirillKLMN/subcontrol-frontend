import { describe, expect, it } from "vitest";

import { validatePasswordChange, validateProfileName } from "./profileValidation";

describe("настройки профиля", () => {
  it("проверяет длину имени после обрезки пробелов", () => {
    expect(validateProfileName(" ")).toBeTruthy();
    expect(validateProfileName(" К ")).toBeTruthy();
    expect(validateProfileName("  Кирилл  ")).toBeNull();
    expect(validateProfileName("А".repeat(161))).toBeTruthy();
  });

  it("требует текущий пароль и проверяет длину нового", () => {
    expect(validatePasswordChange("", "12345678", "12345678")).toBeTruthy();
    expect(validatePasswordChange("old", "short", "short")).toBeTruthy();
    expect(validatePasswordChange("old", "a".repeat(129), "a".repeat(129))).toBeTruthy();
  });

  it("не допускает тот же пароль и несовпадающее подтверждение", () => {
    expect(validatePasswordChange("password1", "password1", "password1")).toBeTruthy();
    expect(validatePasswordChange("old", "password2", "password3")).toBeTruthy();
    expect(validatePasswordChange("old", "password2", "password2")).toBeNull();
  });
});
