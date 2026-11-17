import { apiRequest } from "./client";

export type ApiOffboardingItem = {
  id: number;
  service: string;
  instruction: string | null;
  access_revoked: boolean;
  license_returned: boolean;
};

export type ApiOffboardingChecklist = {
  id: number;
  employee: string;
  status: "open" | "closed";
  items: ApiOffboardingItem[];
};

export type ApiOffboardingCreate = {
  employee: string;
  services: string[];
};

export type ApiOffboardingItemPatch = {
  access_revoked?: boolean;
  license_returned?: boolean;
};

// Получить все чек-листы
export function getOffboardingChecklists(): Promise<
  ApiOffboardingChecklist[]
> {
  return apiRequest<ApiOffboardingChecklist[]>(
    "/api/offboarding",
  );
}

// Создать чек-лист
export function createOffboardingChecklist(
  data: ApiOffboardingCreate,
): Promise<ApiOffboardingChecklist> {
  return apiRequest<ApiOffboardingChecklist>(
    "/api/offboarding",
    {
      method: "POST",
      body: data,
    },
  );
}

// Обновить пункт чек-листа
export function updateOffboardingItem(
  itemId: number,
  data: ApiOffboardingItemPatch,
): Promise<ApiOffboardingItem> {
  return apiRequest<ApiOffboardingItem>(
    `/api/offboarding/items/${itemId}`,
    {
      method: "PATCH",
      body: data,
    },
  );
}

// Закрыть чек-лист
export function closeOffboardingChecklist(
  checklistId: number,
): Promise<ApiOffboardingChecklist> {
  return apiRequest<ApiOffboardingChecklist>(
    `/api/offboarding/${checklistId}/close`,
    {
      method: "POST",
    },
  );
}
