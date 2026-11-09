import { supabase } from "@/integrations/supabase/client";
import { KEY_PAGE_SIZE, pageRange } from "@/lib/key-board";

export async function fetchKeyPage(start = 0) {
  const query = supabase.from("nusuk_keys")
    .select("id,key_value,is_admin_drop,created_at")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });
  return start === 0 ? query.limit(KEY_PAGE_SIZE) : query.range(...pageRange(start));
}

export async function fetchKeyCount() {
  return supabase.from("nusuk_keys").select("*", { count: "exact", head: true });
}