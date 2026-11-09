import { beforeEach, describe, expect, it, vi } from "vitest";
const api = vi.hoisted(() => ({ from: vi.fn(), select: vi.fn(), order: vi.fn(), limit: vi.fn(), range: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: api.from } }));
import { fetchKeyCount, fetchKeyPage } from "@/lib/board-data";

beforeEach(() => {
  vi.clearAllMocks();
  api.from.mockReturnValue(api);
  api.select.mockReturnValue(api);
  api.order.mockReturnValue(api);
  api.limit.mockResolvedValue({ data: [], error: null });
  api.range.mockResolvedValue({ data: [], error: null });
});

describe("Board data requests", () => {
  it("fetches only the latest 50 keys initially from the historical table", async () => {
    await fetchKeyPage();
    expect(api.from).toHaveBeenCalledWith("nusuk_keys");
    expect(api.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(api.limit).toHaveBeenCalledWith(50);
    expect(api.range).not.toHaveBeenCalled();
  });
  it("fetches exactly the next 50 keys", async () => {
    await fetchKeyPage(50);
    expect(api.range).toHaveBeenCalledWith(50, 99);
    expect(api.limit).not.toHaveBeenCalled();
  });
  it("counts all 1700 rows without downloading them or capping at 1000", async () => {
    api.select.mockResolvedValueOnce({ count: 1700, data: null, error: null });
    const result = await fetchKeyCount();
    expect(api.from).toHaveBeenCalledWith("nusuk_keys");
    expect(api.select).toHaveBeenCalledWith("*", { count: "exact", head: true });
    expect(result.count).toBe(1700);
    expect(result.data).toBeNull();
    expect(api.limit).not.toHaveBeenCalled();
  });
});