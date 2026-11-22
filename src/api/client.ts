import {
  clearAccessToken,
  getAccessToken,
} from "./session";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000"
).replace(/\/+$/, "");

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);

    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers, auth = true, ...rest } = options;

  const requestHeaders = new Headers(headers);

  const token = auth ? getAccessToken() : null;

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const isFormData = body instanceof FormData;

  if (body !== undefined && !isFormData) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const path = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,   
    ...(body !== undefined
      ? {
          body: isFormData
            ? body
            : JSON.stringify(body),
        }
      : {}),
  });

  if (!response.ok) {
    if (
      response.status === 401 &&
      token &&
      getAccessToken() === token
    ) {
      clearAccessToken();
    }
    let message = `Ошибка API: ${response.status}`;

    try {
      const error: unknown = await response.json();

      if (
        typeof error === "object" &&
        error !== null &&
        "detail" in error &&
        typeof error.detail === "string"
      ) {
        message = error.detail;
      }
    } catch {
      // Ответ сервера может не содержать JSON.
    }

    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
