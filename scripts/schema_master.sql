-- ============================================================
-- Brightside Finance — Master Schema  (safe to re-run)
-- Run in: Supabase Dashboard → SQL Editor → New Query
--
-- REQUIRED tables (8 total):
--   auth.users                    — Supabase built-in, do not touch
--   public.profiles               — user display info + preferences
--   public.stocks                 — live market data (Python updater writes here)
--   public.stock_history          — JSONB price history per symbol
--   public.game_state             — main game portfolio per user
--   public.competitions           — competition definitions
--   public.competition_portfolios — per-user competition portfolios
--   public.admin_users            — admin user list
--   public.banned_users           — banned user list
-- ============================================================

-- ── 1. profiles ───────────────────────────────────────────────
-- Supabase Auth creates auth.users automatically.
-- profiles is a separate public table linked by UUID.
-- The sync_auth_to_profile trigger (section 7) keeps full_name/photo_url
-- in sync with OAuth metadata so leaderboard queries never join auth.users.
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  email       TEXT,
  photo_url   TEXT,
  dob         DATE,
  preferences JSONB        NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferences JSONB NOT NULL DEFAULT '{}';
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users read own profile"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ── 2. stocks ─────────────────────────────────────────────────
-- Written by scripts/update_prices.py every few seconds.
-- Public read-only. Only the service role writes.
CREATE TABLE IF NOT EXISTS public.stocks (
  symbol          TEXT PRIMARY KEY,
  name            TEXT,
  price           NUMERIC,
  change          NUMERIC,
  "changePercent" NUMERIC,
  volume          BIGINT,
  "dayHigh"       NUMERIC,
  "dayLow"        NUMERIC,
  high52w         NUMERIC,
  low52w          NUMERIC,
  bid             NUMERIC,
  ask             NUMERIC,
  market_cap      NUMERIC,
  pe_ratio        NUMERIC,
  revenue_growth  NUMERIC,
  avg_daily_chg   NUMERIC,
  open_price      NUMERIC,
  close_price     NUMERIC,
  "updatedAt"     TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.stocks ADD COLUMN IF NOT EXISTS market_cap      NUMERIC;
ALTER TABLE public.stocks ADD COLUMN IF NOT EXISTS pe_ratio        NUMERIC;
ALTER TABLE public.stocks ADD COLUMN IF NOT EXISTS revenue_growth  NUMERIC;
ALTER TABLE public.stocks ADD COLUMN IF NOT EXISTS avg_daily_chg   NUMERIC;
ALTER TABLE public.stocks ADD COLUMN IF NOT EXISTS open_price      NUMERIC;
ALTER TABLE public.stocks ADD COLUMN IF NOT EXISTS close_price     NUMERIC;
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read stocks" ON public.stocks;
CREATE POLICY "Public read stocks"
  ON public.stocks FOR SELECT USING (true);

-- ── 3. stock_history ──────────────────────────────────────────
-- One row per symbol. `prices` is a JSONB array of {date, price} objects.
-- Written by update_prices.py once per day after market close.
CREATE TABLE IF NOT EXISTS public.stock_history (
  symbol      TEXT PRIMARY KEY,
  prices      JSONB       NOT NULL DEFAULT '[]',
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.stock_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read stock_history" ON public.stock_history;
CREATE POLICY "Public read stock_history"
  ON public.stock_history FOR SELECT USING (true);

-- ── 4. game_state ─────────────────────────────────────────────
-- Main game portfolio. One row per user, auto-created on first login.
-- holdings JSONB stores long positions AND shorts (SHORT:SYMBOL keys).
CREATE TABLE IF NOT EXISTS public.game_state (
  uid         UUID    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cash        NUMERIC NOT NULL DEFAULT 100000,
  holdings    JSONB   NOT NULL DEFAULT '{}',
  total_value NUMERIC NOT NULL DEFAULT 100000,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.game_state ADD COLUMN IF NOT EXISTS total_value NUMERIC NOT NULL DEFAULT 100000;
ALTER TABLE public.game_state ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.game_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own game state" ON public.game_state;
CREATE POLICY "Users manage own game state"
  ON public.game_state FOR ALL USING (auth.uid() = uid);

-- ── 5. admin_users ────────────────────────────────────────────
-- Simple allow-list for admin access. Rows inserted manually.
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_can_read_own_admin_row" ON public.admin_users;
CREATE POLICY "users_can_read_own_admin_row"
  ON public.admin_users FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ── 6. banned_users ───────────────────────────────────────────
-- Users in this table are blocked from the simulator.
CREATE TABLE IF NOT EXISTS public.banned_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_can_read_own_ban_row"   ON public.banned_users;
DROP POLICY IF EXISTS "Admins manage banned_users"   ON public.banned_users;
CREATE POLICY "users_can_read_own_ban_row"
  ON public.banned_users FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage banned_users"
  ON public.banned_users FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- ── 7. competitions ───────────────────────────────────────────
-- Competition definitions. Admins insert/update/delete; all users read.
-- status: 'upcoming' | 'open' | 'enrolling' | 'active' | 'ended'
CREATE TABLE IF NOT EXISTS public.competitions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  description   TEXT,
  start_date    DATE        NOT NULL,
  end_date      DATE        NOT NULL,
  starting_cash NUMERIC     NOT NULL DEFAULT 100000,
  status        TEXT        NOT NULL DEFAULT 'upcoming',
  visibility    TEXT        NOT NULL DEFAULT 'public',
  join_code     TEXT,
  admin_user_id UUID        REFERENCES auth.users(id),
  prize_info    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS status        TEXT NOT NULL DEFAULT 'upcoming';
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS visibility    TEXT NOT NULL DEFAULT 'public';
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS join_code     TEXT;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS admin_user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read competitions"    ON public.competitions;
DROP POLICY IF EXISTS "Admins insert competitions"  ON public.competitions;
DROP POLICY IF EXISTS "Admins update competitions"  ON public.competitions;
DROP POLICY IF EXISTS "Admins delete competitions"  ON public.competitions;
CREATE POLICY "Public read competitions"
  ON public.competitions FOR SELECT USING (true);
CREATE POLICY "Admins insert competitions"
  ON public.competitions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Admins update competitions"
  ON public.competitions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Admins delete competitions"
  ON public.competitions FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- ── 8. competition_portfolios ─────────────────────────────────
-- Per-user per-competition portfolios.
-- holdings JSONB same format as game_state (includes SHORT: keys).
CREATE TABLE IF NOT EXISTS public.competition_portfolios (
  uid            UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_id UUID    NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  cash           NUMERIC NOT NULL DEFAULT 100000,
  holdings       JSONB   NOT NULL DEFAULT '{}',
  total_value    NUMERIC NOT NULL DEFAULT 100000,
  enrolled_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (uid, competition_id)
);
ALTER TABLE public.competition_portfolios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone reads competition portfolios" ON public.competition_portfolios;
DROP POLICY IF EXISTS "Users insert own comp portfolio"     ON public.competition_portfolios;
DROP POLICY IF EXISTS "Users update own comp portfolio"     ON public.competition_portfolios;
CREATE POLICY "Anyone reads competition portfolios"
  ON public.competition_portfolios FOR SELECT USING (true);
CREATE POLICY "Users insert own comp portfolio"
  ON public.competition_portfolios FOR INSERT WITH CHECK (auth.uid() = uid);
CREATE POLICY "Users update own comp portfolio"
  ON public.competition_portfolios FOR UPDATE USING (auth.uid() = uid);

-- ── 9. Leaderboard RPCs + supporting objects ──────────────────

-- Trigger: sync OAuth name + avatar into profiles on every auth insert/update
-- so leaderboard queries never need to touch auth.users (cross-schema JOIN is slow).
CREATE OR REPLACE FUNCTION public.sync_auth_to_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, photo_url)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = CASE
      WHEN NULLIF(TRIM(EXCLUDED.full_name), '') IS NOT NULL THEN EXCLUDED.full_name
      ELSE profiles.full_name
    END,
    photo_url = COALESCE(EXCLUDED.photo_url, profiles.photo_url);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_upsert ON auth.users;
CREATE TRIGGER on_auth_user_upsert
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_auth_to_profile();

-- Indexes for ORDER BY — without these Postgres sorts the full table in memory.
CREATE INDEX IF NOT EXISTS idx_game_state_total_value
  ON public.game_state(total_value DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_comp_portfolios_comp_value
  ON public.competition_portfolios(competition_id, total_value DESC NULLS LAST);

CREATE OR REPLACE FUNCTION public.get_main_leaderboard()
RETURNS TABLE(
  uid          UUID,
  display_name TEXT,
  photo_url    TEXT,
  total_value  NUMERIC,
  return_pct   NUMERIC,
  updated_at   TIMESTAMPTZ
)
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT
    g.uid,
    COALESCE(NULLIF(TRIM(p.full_name), ''), 'Anonymous')::TEXT,
    p.photo_url::TEXT,
    g.total_value,
    ROUND(((g.total_value - 100000.0) / 100000.0 * 100.0)::NUMERIC, 2),
    g.updated_at
  FROM   public.game_state g
  LEFT JOIN public.profiles p ON p.id = g.uid
  ORDER  BY g.total_value DESC
  LIMIT  100;
$$;

CREATE OR REPLACE FUNCTION public.get_competition_leaderboard(comp_id UUID)
RETURNS TABLE(
  uid          UUID,
  display_name TEXT,
  photo_url    TEXT,
  total_value  NUMERIC,
  return_pct   NUMERIC,
  enrolled_at  TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ
)
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT
    cp.uid,
    COALESCE(NULLIF(TRIM(p.full_name), ''), 'Anonymous')::TEXT,
    p.photo_url::TEXT,
    cp.total_value,
    ROUND(((cp.total_value - c.starting_cash) / c.starting_cash * 100.0)::NUMERIC, 2),
    cp.enrolled_at,
    cp.updated_at
  FROM   public.competition_portfolios cp
  JOIN   public.competitions           c ON c.id  = cp.competition_id
  LEFT JOIN public.profiles            p ON p.id  = cp.uid
  WHERE  cp.competition_id = comp_id
  ORDER  BY cp.total_value DESC
  LIMIT  100;
$$;

GRANT EXECUTE ON FUNCTION public.get_main_leaderboard()            TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_competition_leaderboard(UUID) TO anon, authenticated;

-- ── 10. Realtime ──────────────────────────────────────────────
-- Required for live stock prices and portfolio sync in the simulator.
-- Run these only if the tables are not already in the publication.
-- Check first: SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.stocks;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.game_state;

-- ── 11. Seed Summer 2026 competition ──────────────────────────
INSERT INTO public.competitions
  (name, description, start_date, end_date, starting_cash, status, visibility, prize_info)
VALUES (
  'Summer 2026 Trading Challenge',
  'Compete against other Brightside members in our first official 3-month trading competition. Start with $100,000 in virtual cash — the top portfolios win.',
  '2026-06-14', '2026-09-14', 100000, 'open', 'public',
  'Top 3 finishers earn recognition on the Brightside leaderboard'
)
ON CONFLICT DO NOTHING;
