// src/lib/storage.ts

const USER_KEY = "hirecore_user";

export function setStoredUser(user: unknown) {
  if (typeof window === "undefined") return;

  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser<T = unknown>(): T | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearAuthStorage() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(USER_KEY);
}

export type MarketplaceNavMode = "WORKER" | "EMPLOYER";

const NAV_MODE_KEY = "hirecore_nav_mode";

export function setStoredNavMode(mode: MarketplaceNavMode) {
  if (typeof window === "undefined") return;

  localStorage.setItem(NAV_MODE_KEY, mode);
}

export function getStoredNavMode(): MarketplaceNavMode | null {
  if (typeof window === "undefined") return null;

  const value = localStorage.getItem(NAV_MODE_KEY);

  if (value === "WORKER" || value === "EMPLOYER") {
    return value;
  }

  return null;
}

export function clearStoredNavMode() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(NAV_MODE_KEY);
}
