const TOKEN_STORAGE_KEY = "subcontrol.accessToken";

const sessionClearedListeners = new Set<() => void>();

export function onSessionCleared(
  listener: () => void,
): () => void {
  sessionClearedListeners.add(listener);

  return () => {
    sessionClearedListeners.delete(listener);
  };
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveAccessToken(token: string): void {
  window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAccessToken(): void {
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // Хранилище может быть недоступно.
    }
  }

  sessionClearedListeners.forEach((listener) => listener());
}