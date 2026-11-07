export const COPIED_STORAGE = "nusuk_copied_keys";
export const HIDE_STORAGE = "nusuk_hide_used";
export const SHARE_URL = "https://nusuk-key-compass.vercel.app/";
export type BoardKey = { id: string; key_value: string; is_admin_drop: boolean; created_at: string };
export function readHideUsed(saved: string | null) { return saved !== "0"; }
export function readCopied(saved: string | null): string[] {
  try { const value: unknown = JSON.parse(saved || "[]"); return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : []; }
  catch { return []; }
}
export function sortKeys(keys: BoardKey[], copied: string[], active: boolean) {
  return [...keys].sort((a, b) => {
    if (active) { const difference = Number(copied.includes(a.id)) - Number(copied.includes(b.id)); if (difference) return difference; }
    return +new Date(b.created_at) - +new Date(a.created_at);
  });
}
export function visibleKeys(keys: BoardKey[], copied: string[], hide: boolean, fading: string[]) {
  return hide ? keys.filter((key) => !copied.includes(key.id) || fading.includes(key.id)) : keys;
}