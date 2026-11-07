import { describe, expect, it } from "vitest";
import { bulkKeyRows, parseBulkKeys } from "@/lib/bulk-keys";

describe("Bulk admin keys", () => {
  it("splits commas and newlines and trims whitespace", () => {
    expect(parseBulkKeys(" KEY-1, KEY-2\nKEY-3\r\n KEY-4 ")).toEqual(["KEY-1", "KEY-2", "KEY-3", "KEY-4"]);
  });
  it("removes empty entries without dropping duplicate keys", () => {
    expect(parseBulkKeys(", \nKEY-1,, KEY-1\n ")).toEqual(["KEY-1", "KEY-1"]);
  });
  it("marks every row as an admin drop and counts the clean batch", () => {
    const rows = bulkKeyRows("KEY-1,KEY-2\nKEY-3,,");
    expect(rows).toEqual([
      { key_value: "KEY-1", is_admin_drop: true },
      { key_value: "KEY-2", is_admin_drop: true },
      { key_value: "KEY-3", is_admin_drop: true },
    ]);
    expect(rows.length).toBe(3);
  });
  it("rejects an empty batch", () => { expect(() => bulkKeyRows(",\n ")).toThrow(); });
  it("retains the existing 500-character per-key limit", () => {
    expect(bulkKeyRows("A".repeat(500))[0]?.key_value.length).toBe(500);
    expect(() => bulkKeyRows("VALID," + "A".repeat(501))).toThrow();
  });
});