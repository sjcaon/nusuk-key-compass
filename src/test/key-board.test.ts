import { describe, it, expect } from "vitest";
import { readHideUsed, readCopied, sortKeys, visibleKeys, SHARE_URL, type BoardKey } from "@/lib/key-board";
const old: BoardKey = { id: "old", key_value: "OLD", is_admin_drop: true, created_at: "2026-11-06T00:00:00Z" };
const fresh: BoardKey = { id: "fresh", key_value: "FRESH", is_admin_drop: false, created_at: "2026-11-07T00:00:00Z" };
describe("Production board rules", () => {
  it("defaults hide-used ON and respects a saved OFF preference", () => { expect(readHideUsed(null)).toBe(true); expect(readHideUsed("0")).toBe(false); });
  it("retains previously copied key IDs", () => { expect(readCopied('["old"]')).toEqual(["old"]); expect(readCopied("invalid")).toEqual([]); });
  it("removes copied cards after their exit animation when ON", () => { expect(visibleKeys([old, fresh], ["old"], true, ["old"])).toEqual([old, fresh]); expect(visibleKeys([old, fresh], ["old"], true, [])).toEqual([fresh]); });
  it("keeps used cards when OFF", () => { expect(visibleKeys([old, fresh], ["old"], false, [])).toEqual([old, fresh]); });
  it("puts newest keys first even ahead of older verified drops", () => { expect(sortKeys([old, fresh], [], false).map(k => k.id)).toEqual(["fresh", "old"]); });
  it("shares the requested Vercel address", () => { expect(SHARE_URL).toBe("https://nusuk-key-compass.vercel.app/"); });
});