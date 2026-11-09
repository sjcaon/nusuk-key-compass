import { describe, it, expect } from "vitest";
import { readHideUsed, readCopied, sortKeys, visibleKeys, SHARE_URL, communityKeySchema, nusukKeyUrl, connectedUsers, boardCards, PINNED_KEY, pageRange, appendKeys, type BoardKey } from "@/lib/key-board";
const old: BoardKey = { id: "old", key_value: "OLD", is_admin_drop: true, created_at: "2026-11-06T00:00:00Z" };
const fresh: BoardKey = { id: "fresh", key_value: "FRESH", is_admin_drop: false, created_at: "2026-11-07T00:00:00Z" };
describe("Production board rules", () => {
  it("keeps the exact sponsored key first in both sorts even after copying", () => {
    for (const active of [true, false]) {
      const cards = boardCards([old, fresh, { ...old, key_value: "NG-KASwudnf" }], [PINNED_KEY.id, "old"], true, [], active);
      expect(cards.map((key) => key.key_value)).toEqual(["NG-KASwudnf", "FRESH"]);
      expect(nusukKeyUrl(cards[0].key_value)).toBe("https://services.nusuk.sa/app?p=27&id=NG-KASwudnf");
    }
  });
  it("requests the next 50 rows with inclusive non-overlapping ranges", () => {
    expect(pageRange(0)).toEqual([0, 49]);
    expect(pageRange(50)).toEqual([50, 99]);
    expect(pageRange(100)).toEqual([100, 149]);
  });
  it("appends pages without duplicating previously fetched row IDs", () => {
    expect(appendKeys([fresh], [fresh, old]).map((key) => key.id)).toEqual(["fresh", "old"]);
  });
  it("accepts NG- followed by exactly eight alphanumeric characters", () => {
    expect(communityKeySchema.safeParse("NG-aB12Cd34").success).toBe(true);
    for (const invalid of ["NSK-aB12Cd34", "ng-aB12Cd34", "NG-aB12Cd3", "NG-aB12Cd345", "NG-aB12Cd3_", " NG-aB12Cd34", "NG-aB12Cd34\n"]) {
      expect(communityKeySchema.safeParse(invalid).success).toBe(false);
    }
  });
  it("opens each exact key in the Nusuk challenge and safely encodes legacy values", () => {
    expect(nusukKeyUrl("NG-aB12Cd34")).toBe("https://services.nusuk.sa/app?p=27&id=NG-aB12Cd34");
    expect(new URL(nusukKeyUrl("legacy & code#1")).searchParams.get("id")).toBe("legacy & code#1");
  });
  it("counts connected visitors once across multiple tabs and removes departed visitors", () => {
    expect(connectedUsers({ a: [{ visitor_id: "a" }, { visitor_id: "a" }], b: [{ visitor_id: "b" }] })).toBe(2);
    expect(connectedUsers({ a: [{ visitor_id: "a" }] })).toBe(1);
    expect(connectedUsers({})).toBe(0);
  });
  it("defaults hide-used ON and respects a saved OFF preference", () => { expect(readHideUsed(null)).toBe(true); expect(readHideUsed("0")).toBe(false); });
  it("retains previously copied key IDs", () => { expect(readCopied('["old"]')).toEqual(["old"]); expect(readCopied("invalid")).toEqual([]); });
  it("removes copied cards after their exit animation when ON", () => { expect(visibleKeys([old, fresh], ["old"], true, ["old"])).toEqual([old, fresh]); expect(visibleKeys([old, fresh], ["old"], true, [])).toEqual([fresh]); });
  it("keeps used cards when OFF", () => { expect(visibleKeys([old, fresh], ["old"], false, [])).toEqual([old, fresh]); });
  it("puts newest keys first even ahead of older verified drops", () => { expect(sortKeys([old, fresh], [], false).map(k => k.id)).toEqual(["fresh", "old"]); });
  it("shares the requested Vercel address", () => { expect(SHARE_URL).toBe("https://nusuk-key-compass.vercel.app/"); });
});