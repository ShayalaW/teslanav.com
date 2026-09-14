// localStorage access with one-time migration from the legacy key prefix.
// Reads fall back to the legacy key, migrate it forward, and delete it.

const PREFIX = "radar-";
const LEGACY_PREFIX = "teslanav-";

export function storageGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(PREFIX + key);
  if (value !== null) return value;
  const legacy = localStorage.getItem(LEGACY_PREFIX + key);
  if (legacy !== null) {
    localStorage.setItem(PREFIX + key, legacy);
    localStorage.removeItem(LEGACY_PREFIX + key);
    return legacy;
  }
  return null;
}

export function storageSet(key: string, value: string): void {
  localStorage.setItem(PREFIX + key, value);
}

export function storageRemove(key: string): void {
  localStorage.removeItem(PREFIX + key);
  localStorage.removeItem(LEGACY_PREFIX + key);
}
