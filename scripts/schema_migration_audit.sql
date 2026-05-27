-- ============================================================
-- Brightside Finance — Audit Fixes Migration  (safe to re-run)
-- Run in: Supabase Dashboard → SQL Editor → New Query
--
-- Fix #1: Admins can't reset/modify other users' game_state because the
--         only policy restricts writes to auth.uid() = uid. Add an admin
--         override policy.
-- Fix #5: sync_auth_to_profile trigger never populated profiles.email.
--         Update it to sync email on every auth insert/update.
-- ============================================================

-- ── Fix #1: Admin override on game_state ──────────────────────
DROP POLICY IF EXISTS "Admins manage game_state" ON public.game_state;
CREATE POLICY "Admins manage game_state"
  ON public.game_state FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- ── Fix #5: Sync email into profiles ──────────────────────────
CREATE OR REPLACE FUNCTION public.sync_auth_to_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, photo_url)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = CASE
      WHEN NULLIF(TRIM(EXCLUDED.full_name), '') IS NOT NULL THEN EXCLUDED.full_name
      ELSE profiles.full_name
    END,
    email     = COALESCE(EXCLUDED.email, profiles.email),
    photo_url = COALESCE(EXCLUDED.photo_url, profiles.photo_url);
  RETURN NEW;
END;
$$;

-- Backfill email for existing rows that are missing it.
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

-- ── Leave-competition support: allow users to delete their own enrollment ──
DROP POLICY IF EXISTS "Users delete own comp portfolio" ON public.competition_portfolios;
CREATE POLICY "Users delete own comp portfolio"
  ON public.competition_portfolios FOR DELETE USING (auth.uid() = uid);
