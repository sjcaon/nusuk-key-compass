import { describe, it, expect } from "vitest";
import { supabase } from "@/integrations/supabase/client";

// Opt in against the connected backend; these checks never add keys or delete historical data.
describe.runIf(process.env["RUN_LIVE_DATABASE_TESTS"] === "1")("Database-enforced public rules", () => {
  it("rejects malformed keys even when bypassing the form", async () => {
    const { error } = await supabase.from("nusuk_keys").insert({ key_value: "INVALID-SPAM" });
    expect(error?.code).toBe("23514");
  });
  it("rejects an already-shared key even when bypassing the form", async () => {
    const { data, error: readError } = await supabase.from("nusuk_keys").select("key_value").eq("key_value", "NG-NI8aLy94").limit(1);
    expect(readError).toBeNull();
    expect(data?.length).toBe(1);
    const { error } = await supabase.from("nusuk_keys").insert({ key_value: "NG-NI8aLy94" });
    expect(error?.code).toBe("23505");
  });
  it("counts a page load once even if the same request is retried", async () => {
    const p_load_id = crypto.randomUUID();
    const results = await Promise.all([
      supabase.rpc("record_page_load", { p_load_id }),
      supabase.rpc("record_page_load", { p_load_id }),
    ]);
    expect(results.map((result) => result.error)).toEqual([null, null]);
    expect(results[0].data).toBe(results[1].data);
    expect(Number(results[0].data)).toBeGreaterThan(0);
    const { data, error } = await supabase.rpc("record_page_load", { p_load_id });
    expect(error).toBeNull();
    expect(data).toBe(results[0].data);
  });
});