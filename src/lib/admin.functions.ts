import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ADMIN_EMAIL = "siamhosain720@gmail.com";
const ADMIN_PASSWORD = "Admin@12345";

const creds = z.object({ email: z.string().max(255), password: z.string().max(255) });

function check(c: { email: string; password: string }) {
  if (c.email.trim().toLowerCase() !== ADMIN_EMAIL || c.password !== ADMIN_PASSWORD) {
    throw new Error("Invalid admin credentials");
  }
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((i) => creds.parse(i))
  .handler(async ({ data }) => {
    check(data);
    return { ok: true };
  });

export const adminAddKey = createServerFn({ method: "POST" })
  .inputValidator((i) => creds.extend({ key_value: z.string().trim().min(1).max(500) }).parse(i))
  .handler(async ({ data }) => {
    check(data);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("nusuk_keys")
      .insert({ key_value: data.key_value, is_admin_drop: true });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteKey = createServerFn({ method: "POST" })
  .inputValidator((i) => creds.extend({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    check(data);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("nusuk_keys").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
