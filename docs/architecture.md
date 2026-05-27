# Brightside Finance — Architecture Reference

This document covers the database schema, web app structure, and a blueprint for implementing a mobile app against the same Supabase backend.

---

## Database Schema

### `profiles`
Linked 1:1 to `auth.users` by UUID. Created on sign-up, kept in sync with OAuth metadata via the `sync_auth_to_profile` trigger.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | FK → `auth.users(id)` ON DELETE CASCADE |
| `full_name` | TEXT | Synced from OAuth metadata by trigger |
| `email` | TEXT | |
| `photo_url` | TEXT | Synced from OAuth `avatar_url` by trigger |
| `dob` | DATE | |
| `preferences` | JSONB | `{ dark_mode: bool }` — persisted user settings |
| `created_at` | TIMESTAMPTZ | |

RLS: users read/write own row only. Trigger (`sync_auth_to_profile`) runs as SECURITY DEFINER and bypasses RLS to upsert on every auth event.

---

### `stocks`
Live market data. Written every ~2 minutes by `scripts/update_prices.py`. Never written by the client.

| Column | Type | Notes |
|---|---|---|
| `symbol` | TEXT PK | Ticker symbol |
| `name` | TEXT | Company display name |
| `price` | NUMERIC | Latest trade price |
| `change` | NUMERIC | Price change vs previous close |
| `changePercent` | NUMERIC | Percent change vs previous close |
| `volume` | BIGINT | Cumulative daily volume |
| `dayHigh` / `dayLow` | NUMERIC | Intraday range |
| `high52w` / `low52w` | NUMERIC | 52-week range (from fundamentals pass) |
| `bid` / `ask` | NUMERIC | |
| `market_cap` | NUMERIC | |
| `pe_ratio` | NUMERIC | Trailing P/E |
| `revenue_growth` | NUMERIC | |
| `avg_daily_chg` | NUMERIC | 30-day average daily % move |
| `open_price` | NUMERIC | Today's open — used as prev-close fallback |
| `close_price` | NUMERIC | Previous session close |
| `updatedAt` | TIMESTAMPTZ | |

RLS: public read, service-role-only write. Realtime-enabled (live price feed to simulator).

---

### `stock_history`
One row per symbol. Appended once per day after market close.

| Column | Type | Notes |
|---|---|---|
| `symbol` | TEXT PK | |
| `prices` | JSONB | `[{ date: "2026-05-26", price: 182.34 }, ...]` — capped at 5 years |
| `updatedAt` | TIMESTAMPTZ | |

RLS: public read.

---

### `game_state`
Main simulator portfolio. One row per user, auto-created on first login.

| Column | Type | Notes |
|---|---|---|
| `uid` | UUID PK | FK → `auth.users(id)` ON DELETE CASCADE |
| `cash` | NUMERIC | Available buying power (default 100,000) |
| `holdings` | JSONB | Long positions: `{ "AAPL": { shares: 10, avgCost: 175.00 } }`. Short positions use `SHORT:` prefix: `{ "SHORT:TSLA": { shares: 5, avgShortPrice: 250.00 } }` |
| `total_value` | NUMERIC | cash + long value − short liability |
| `updated_at` | TIMESTAMPTZ | |

RLS: users read/write own row only. Realtime-enabled (multi-device portfolio sync).

---

### `competitions`
Competition definitions. Created and managed by admins.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `name` | TEXT | |
| `description` | TEXT | |
| `start_date` / `end_date` | DATE | |
| `starting_cash` | NUMERIC | Virtual cash each participant starts with |
| `status` | TEXT | `'upcoming'` \| `'open'` \| `'active'` \| `'ended'` |
| `visibility` | TEXT | `'public'` \| `'private'` |
| `join_code` | TEXT | Required for private competitions |
| `admin_user_id` | UUID | FK → `auth.users(id)` |
| `prize_info` | TEXT | |
| `created_at` | TIMESTAMPTZ | |

RLS: public read. INSERT/UPDATE/DELETE require row in `admin_users`.

---

### `competition_portfolios`
Per-user per-competition portfolio. Same holdings format as `game_state`.

| Column | Type | Notes |
|---|---|---|
| `uid` | UUID | Composite PK with `competition_id` |
| `competition_id` | UUID | FK → `competitions(id)` ON DELETE CASCADE |
| `cash` | NUMERIC | |
| `holdings` | JSONB | Same format as `game_state.holdings` |
| `total_value` | NUMERIC | |
| `enrolled_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

RLS: public read, users write own row only.

---

### `admin_users` / `banned_users`
Simple allow/deny lists. Rows inserted manually.

| Column | Type |
|---|---|
| `user_id` | UUID PK, FK → `auth.users(id)` |

RLS: users can read their own row only. `banned_users` additionally allows admin write.

---

### RPC Functions

| Function | Returns | Notes |
|---|---|---|
| `get_main_leaderboard()` | 100 rows | Sorted by `total_value DESC`. Joins `profiles` only — no `auth.users` join. |
| `get_competition_leaderboard(comp_id UUID)` | 100 rows | Same pattern, filtered by competition. |

Both are `LANGUAGE sql STABLE SECURITY DEFINER` for planner inlining and RLS bypass.

---

### Indexes

```sql
idx_game_state_total_value          ON game_state(total_value DESC NULLS LAST)
idx_comp_portfolios_comp_value      ON competition_portfolios(competition_id, total_value DESC NULLS LAST)
```

---

### Realtime Publications
Both tables must be in the `supabase_realtime` publication:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.stocks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_state;
```

---

## Web App Structure

**Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, Supabase JS, Chart.js

All pages are `'use client'` components under `src/app/`. Global layout wraps everything in `<AuthProvider> → <Navbar> → <main> → <Footer>`.

### Auth Flow
`src/contexts/AuthContext.tsx` provides `{ user, session, profile, authLoading, adminLoading, isAdmin, isBanned, signOut, refreshProfile, savePreference }` via `useAuth()`.

1. `useLayoutEffect` reads the cached Supabase token from `localStorage` synchronously before first paint — eliminates auth flicker.
2. `getSession()` verifies the session with Supabase on mount.
3. `onAuthStateChange` keeps state in sync on sign-in/out/refresh.
4. `checkAdminAndBan()` queries `admin_users` and `banned_users` after every session change; sets `adminLoading = true` while in-flight so admin-gated pages don't redirect prematurely.

### Simulator Data Flow
1. Load market data from `localStorage` cache instantly on mount.
2. Fetch all stocks from Supabase in 500-row paginated batches in background.
3. Subscribe to `public:stocks` Realtime channel for live price updates.
4. Load `game_state` for the authenticated user.
5. Subscribe to `game_state_updates` Realtime channel (filtered by `uid`) for multi-device sync.
6. Leaderboard loads eagerly in background once competition state settles, cached in `localStorage` as `lb_main` / `lb_comp`.

### Key Patterns
- `withTimeout(promise, ms, fallback)` — resolves to fallback instead of rejecting; prevents one slow query from blocking the UI.
- Holdings JSONB uses `SHORT:SYMBOL` prefix keys to co-locate longs and shorts in one object.
- Dark mode is set by a blocking inline `<script>` in `<head>` that reads `localStorage.darkMode` before paint. Never use `prefers-color-scheme` — the site always defaults to light.

---

## Mobile App Blueprint

### Recommended Stack

| Purpose | Package |
|---|---|
| Framework | React Native + Expo |
| Navigation | `@react-navigation/native` |
| Supabase client | `@supabase/supabase-js` (same as web) |
| Session storage | `expo-secure-store` (replaces `localStorage`) |
| Local cache | `react-native-mmkv` (replaces `localStorage` for market data) |
| Charts | `victory-native` or `@shopify/react-native-skia` |
| Styling | NativeWind (Tailwind syntax for RN) |

---

### Supabase Client Setup

The only difference from the web client is the storage adapter — sessions must go into `SecureStore`, not `localStorage`.

```typescript
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      getItem:    (key) => SecureStore.getItemAsync(key),
      setItem:    (key, value) => SecureStore.setItemAsync(key, value),
      removeItem: (key) => SecureStore.deleteItemAsync(key),
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // required on mobile
  },
});
```

OAuth (Google, GitHub) requires `expo-auth-session` to handle the deep-link redirect URI.

---

### Auth Flow

Identical logic to the web `AuthContext` — copy it directly and swap:
- `localStorage` → `SecureStore`
- `useLayoutEffect` → load session from SecureStore in an `useEffect` on mount
- `window.location.href = '/'` → `navigation.navigate('Home')`

Sign-out:
```typescript
const signOut = async () => {
  await Promise.race([
    supabase.auth.signOut().catch(() => {}),
    new Promise(resolve => setTimeout(resolve, 3000)),
  ]);
  await SecureStore.deleteItemAsync('supabase-session');
  // clear other sb- keys
  setUser(null);
  // ...
};
```

---

### Data Flow

```
App launch
  │
  ├─ Load market data from MMKV cache (instant)
  ├─ Load game_state from MMKV cache (instant)
  │
  ├─ Fetch fresh stocks from Supabase (500/batch, background)
  ├─ Fetch game_state for user (background)
  │
  ├─ Subscribe: public:stocks Realtime → update market data
  └─ Subscribe: game_state_updates (uid filter) → update portfolio

On trade
  ├─ Optimistic UI update (instant)
  ├─ supabase.from('game_state').update(...)
  └─ Realtime event confirms or reverts
```

---

### Screen Structure

```
Bottom Tab Navigator
├── Portfolio (Tab 1)
│   ├── Summary card — total value, return %, cash
│   ├── Performance chart (portfolio snapshots)
│   ├── Holdings list — ticker, shares, P&L per position
│   └── Trade history
│
├── Markets (Tab 2)
│   ├── Search bar
│   ├── Watchlist (stored in MMKV)
│   └── Stock table — paginated, sortable, tap → detail sheet
│       └── Stock detail sheet
│           ├── Price chart (stock_history)
│           ├── Key stats (P/E, market cap, 52w range)
│           └── Buy / Sell / Short / Cover buttons
│
├── Competitions (Tab 3)
│   ├── Active competition card
│   ├── Enroll flow
│   ├── Competition portfolio (same as Tab 1, competition mode)
│   └── Leaderboard (main + competition tabs)
│
└── Account (Tab 4)
    ├── Profile — name, avatar, DOB
    ├── Preferences — dark mode toggle (writes to profiles.preferences)
    └── Sign out
```

---

### Web vs Mobile Differences

| Concern | Web | Mobile |
|---|---|---|
| Session storage | `localStorage` | `expo-secure-store` |
| Market data cache | `localStorage` (JSON string) | `react-native-mmkv` |
| Navigation | `window.location.href` / Next.js router | `@react-navigation` |
| Charts | Chart.js (canvas) | Victory Native / Skia |
| Styling | Tailwind CSS | NativeWind / StyleSheet |
| Auth instant load | `useLayoutEffect` + localStorage | SecureStore read on mount |
| Dark mode | `document.documentElement.classList` | `useColorScheme` + context |
| Realtime | Browser WebSocket (auto) | React Native WebSocket (auto) |

---

### Logic Reusable Directly from Web

The following can be copied from `src/app/simulator/page.tsx` with no changes — they have no DOM or browser dependencies:

- All TypeScript interfaces: `StockData`, `Holding`, `ShortPosition`, `TradeEntry`, `Competition`, `LeaderboardEntry`
- `processTrade()` — full buy/sell/short/cover logic
- `withTimeout()` — soft timeout helper
- `buildChartConfig()` data-shaping logic
- `filterHistory()` — range filtering for price history
- All Supabase query logic (table names, column names, RPC calls are identical)
