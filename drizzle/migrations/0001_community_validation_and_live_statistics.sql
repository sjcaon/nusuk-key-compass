CREATE TABLE public.key_submission_registry (key_value text PRIMARY KEY);
GRANT ALL ON public.key_submission_registry TO service_role;
ALTER TABLE public.key_submission_registry ENABLE ROW LEVEL SECURITY;
INSERT INTO public.key_submission_registry(key_value) SELECT DISTINCT key_value FROM public.nusuk_keys;
CREATE OR REPLACE FUNCTION public.guard_community_key() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE registered text;
BEGIN
  IF NOT NEW.is_admin_drop AND NEW.key_value !~ '^NG-[a-zA-Z0-9]{8}$' THEN
    RAISE EXCEPTION 'Use NG- followed by exactly 8 letters or numbers.' USING ERRCODE = '23514';
  END IF;
  INSERT INTO public.key_submission_registry(key_value) VALUES (NEW.key_value) ON CONFLICT DO NOTHING RETURNING key_value INTO registered;
  IF NOT NEW.is_admin_drop AND registered IS NULL THEN
    RAISE EXCEPTION 'This key has already been shared!' USING ERRCODE = '23505';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_community_key() FROM PUBLIC;
CREATE TRIGGER guard_community_key BEFORE INSERT ON public.nusuk_keys FOR EACH ROW EXECUTE FUNCTION public.guard_community_key();
CREATE OR REPLACE FUNCTION public.release_deleted_key() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.key_submission_registry r WHERE r.key_value = OLD.key_value AND NOT EXISTS (SELECT 1 FROM public.nusuk_keys k WHERE k.key_value = OLD.key_value);
  RETURN OLD;
END;
$$;
REVOKE ALL ON FUNCTION public.release_deleted_key() FROM PUBLIC;
CREATE TRIGGER release_deleted_key AFTER DELETE ON public.nusuk_keys FOR EACH ROW EXECUTE FUNCTION public.release_deleted_key();
GRANT SELECT, INSERT ON public.nusuk_keys TO anon, authenticated;
GRANT ALL ON public.nusuk_keys TO service_role;
CREATE TABLE public.site_statistics (id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1), total_views bigint NOT NULL DEFAULT 0);
GRANT SELECT ON public.site_statistics TO anon, authenticated;
GRANT ALL ON public.site_statistics TO service_role;
ALTER TABLE public.site_statistics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view total" ON public.site_statistics FOR SELECT TO anon, authenticated USING (true);
CREATE TABLE public.page_load_events (load_id uuid PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.page_load_events TO service_role;
ALTER TABLE public.page_load_events ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.record_page_load(p_load_id uuid) RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE accepted uuid; result bigint;
BEGIN
  IF p_load_id IS NULL THEN RAISE EXCEPTION 'Page load ID is required'; END IF;
  INSERT INTO public.page_load_events(load_id) VALUES (p_load_id) ON CONFLICT DO NOTHING RETURNING load_id INTO accepted;
  IF accepted IS NOT NULL THEN
    INSERT INTO public.site_statistics(id, total_views) VALUES (1, 1) ON CONFLICT (id) DO UPDATE SET total_views = site_statistics.total_views + 1 RETURNING total_views INTO result;
  ELSE
    SELECT total_views INTO result FROM public.site_statistics WHERE id = 1;
  END IF;
  RETURN COALESCE(result, 0);
END;
$$;
REVOKE ALL ON FUNCTION public.record_page_load(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_page_load(uuid) TO anon, authenticated, service_role;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_statistics;