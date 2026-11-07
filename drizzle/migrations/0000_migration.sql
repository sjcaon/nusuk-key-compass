CREATE TABLE public.nusuk_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_value text NOT NULL CHECK (char_length(key_value) BETWEEN 1 AND 500),
  is_admin_drop boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.nusuk_keys TO anon, authenticated;
GRANT ALL ON public.nusuk_keys TO service_role;
ALTER TABLE public.nusuk_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view keys" ON public.nusuk_keys FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can submit community keys" ON public.nusuk_keys FOR INSERT TO anon, authenticated WITH CHECK (is_admin_drop = false);