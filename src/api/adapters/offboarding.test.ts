import {
  describe,
  expect,
  it,
} from "vitest";

import {
  toChecklist,
  toChecklists,
} from "./offboarding";

import type {
  ApiOffboardingChecklist,
} from "../offboarding";

const apiChecklist: ApiOffboardingChecklist = {
  id: 1,
  employee: "Иван Иванов",
  status: "open",
  items: [
    {
      id: 10,
      service: "Figma",
      instruction: null,
      access_revoked: true,
      license_returned: false,
    },
  ],
};

describe("toChecklist", () => {
  it("преобразует данные API в модель интерфейса", () => {
    const result = toChecklist(apiChecklist);

    expect(result).toEqual({
      id: 1,
      employee: "Иван Иванов",
      closed: false,
      items: [
        {
          id: 10,
          name: "Figma",
          revoked: true,
          returned: false,
        },
      ],
    });
  });

  it("правильно определяет закрытый чек-лист", () => {
    const result = toChecklist({
      ...apiChecklist,
      status: "closed",
    });

    expect(result.closed).toBe(true);
  });
});

describe("toChecklists", () => {
  it("обрабатывает пустой список", () => {
    expect(toChecklists([])).toEqual([]);
  });

  it("преобразует массив чек-листов", () => {
    const result = toChecklists([
      apiChecklist,
    ]);

    expect(result).toHaveLength(1);

    expect(result[0].employee).toBe(
      "Иван Иванов",
    );
  });
});