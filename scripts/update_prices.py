#!/usr/bin/env python3
"""
update_prices.py — Parallel stock price updater.
Completes a full pass of all tracked tickers in under 3 minutes.
"""

import yfinance as yf
from supabase import create_client, Client
import pandas as pd
import requests
import time
import os
import sys
import io
import pytz
from datetime import datetime
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor, wait, FIRST_COMPLETED

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print("Connected to Supabase.")

# ── Tuning ─────────────────────────────────────────────────────────────────────
PRICE_BATCH        = 250   # tickers per yf.download call
MAX_WORKERS        = 5     # parallel download workers (market hours)
CLOSED_WORKERS     = 2     # parallel workers after hours
INTER_GROUP_SLEEP  = 0.5   # seconds between groups of workers
CLOSED_SLEEP       = 3     # seconds between groups after hours
FUND_BATCH         = 15
FUND_SLEEP         = 4
FUND_INTERVAL_SEC  = 4 * 3600
MAX_HISTORY_POINTS = 365 * 5

# ── State ──────────────────────────────────────────────────────────────────────
history_written_today  = False
current_date_str       = ""
last_fundamentals_time = 0.0


def safe_float(value, fallback=0.0):
    try:
        v = float(value)
        return fallback if pd.isna(v) else round(v, 4)
    except (TypeError, ValueError):
        return fallback


def is_market_open():
    cst = pytz.timezone("US/Central")
    now = datetime.now(cst)
    if now.weekday() >= 5:
        return False
    return datetime.strptime("08:30", "%H:%M").time() <= now.time() <= datetime.strptime("15:00", "%H:%M").time()


def market_closed_for_day():
    cst = pytz.timezone("US/Central")
    return datetime.now(cst).time() > datetime.strptime("15:00", "%H:%M").time()


def get_all_tickers():
    """
    Merge DB tickers (always updated) + screener tickers (discover new stocks).
    DB tickers come first so they're never dropped from rotation.
    """
    print("Fetching ticker list...")

    # 1. Pull everything already in the DB so those stocks always get refreshed.
    db_tickers = []
    try:
        resp = supabase.table("stocks").select("symbol").execute()
        if resp.data:
            db_tickers = [r["symbol"] for r in resp.data]
        print(f"  {len(db_tickers)} tickers already in DB.")
    except Exception as e:
        print(f"  DB ticker fetch failed: {e}")

    # 2. Screener for new/active stocks.
    screener_tickers = []
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        for offset in range(0, 5000, 250):
            url = (
                "https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved"
                f"?formatted=false&lang=en-US&region=US&scrIds=most_actives"
                f"&count=250&offset={offset}"
            )
            r = requests.get(url, headers=headers, timeout=15)
            data = r.json()
            quotes = (
                data.get("finance", {})
                    .get("result", [{}])[0]
                    .get("quotes", [])
            )
            if not quotes:
                break
            screener_tickers.extend([q["symbol"] for q in quotes if q.get("symbol")])
        print(f"  {len(screener_tickers)} tickers from screener.")
    except Exception as e:
        print(f"  Screener fetch failed: {e}")

    # Merge (DB first), deduplicate, drop junk symbols.
    seen = set()
    clean = []
    for t in db_tickers + screener_tickers:
        if not t or t in seen:
            continue
        seen.add(t)
        if "$" in t or t.endswith(("-W", "-R", "-U")):
            continue
        clean.append(t)

    print(f"  {len(clean)} total tickers to track.")
    return clean


# ── Price fetch ────────────────────────────────────────────────────────────────

def fetch_prices_batch(batch: list) -> dict:
    """Download 1-minute data for a batch of tickers via yf.download."""
    tickers_str = " ".join(batch)
    _stderr = sys.stderr
    try:
        sys.stderr = io.StringIO()
        df = yf.download(
            tickers_str,
            period="1d",
            interval="1m",
            progress=False,
            threads=True,
            auto_adjust=True,
        )
    except Exception as e:
        sys.stderr = _stderr
        print(f"    download error: {e}")
        return {}
    finally:
        sys.stderr = _stderr

    if df.empty:
        return {}

    multi = len(batch) > 1
    result = {}

    for ticker in batch:
        try:
            if multi:
                closes = df["Close"][ticker].dropna()
                highs  = df["High"][ticker].dropna()
                lows   = df["Low"][ticker].dropna()
                vols   = df["Volume"][ticker].dropna()
                opens  = df["Open"][ticker].dropna()
            else:
                closes = df["Close"].dropna()
                highs  = df["High"].dropna()
                lows   = df["Low"].dropna()
                vols   = df["Volume"].dropna()
                opens  = df["Open"].dropna()

            if closes.empty:
                continue

            result[ticker] = {
                "price":      round(float(closes.iloc[-1]), 2),
                "dayHigh":    round(float(highs.max()),    2) if not highs.empty else 0.0,
                "dayLow":     round(float(lows.min()),     2) if not lows.empty else 0.0,
                "volume":     int(vols.sum())                 if not vols.empty else 0,
                "open_price": round(float(opens.iloc[0]),  2) if not opens.empty else 0.0,
            }
        except Exception:
            pass

    return result


def build_upserts(prices: dict, prev_closes: dict) -> list:
    upserts = []
    for ticker, d in prices.items():
        cp = d["price"]
        if cp <= 0:
            continue
        stored_prev    = prev_closes.get(ticker, 0.0)
        effective_prev = stored_prev if stored_prev > 0 else d["open_price"]
        if effective_prev > 0:
            change     = round(cp - effective_prev, 2)
            change_pct = round((change / effective_prev) * 100, 4)
        else:
            change     = 0.0
            change_pct = 0.0
        upserts.append({
            "symbol":        ticker,
            "price":         cp,
            "change":        change,
            "changePercent": change_pct,
            "dayHigh":       d["dayHigh"],
            "dayLow":        d["dayLow"],
            "volume":        d["volume"],
            "open_price":    d["open_price"],
            "updatedAt":     "now()",
        })
    return upserts


def run_price_pass(tickers: list, market_open: bool) -> int:
    pass_start = time.time()

    # Fetch prev_closes once for the whole pass.
    prev_closes: dict = {}
    try:
        resp = supabase.table("stocks").select("symbol, close_price").execute()
        if resp.data:
            prev_closes = {r["symbol"]: r["close_price"] or 0.0 for r in resp.data}
    except Exception as e:
        print(f"  Could not fetch prev_closes: {e}")

    batches     = [tickers[i:i + PRICE_BATCH] for i in range(0, len(tickers), PRICE_BATCH)]
    n_batches   = len(batches)
    workers     = MAX_WORKERS if market_open else CLOSED_WORKERS
    group_sleep = INTER_GROUP_SLEEP if market_open else CLOSED_SLEEP
    total_upserted = 0

    print(f"  {n_batches} batches × {PRICE_BATCH} tickers, {workers} workers")

    # Process in groups of `workers` — submit a group, wait for all, then next group.
    for group_start in range(0, n_batches, workers):
        group   = batches[group_start:group_start + workers]
        n_group = len(group)

        with ThreadPoolExecutor(max_workers=n_group) as executor:
            futures = {executor.submit(fetch_prices_batch, b): gi for gi, b in enumerate(group)}
            done, _ = wait(futures)

        for future in done:
            gi = futures[future]
            batch_num = group_start + gi + 1
            try:
                prices  = future.result()
                upserts = build_upserts(prices, prev_closes)
            except Exception as e:
                print(f"  [PRICE] Batch {batch_num}/{n_batches} — fetch error: {e}")
                continue

            if upserts:
                try:
                    supabase.table("stocks").upsert(upserts).execute()
                    total_upserted += len(upserts)
                    print(f"  [PRICE] Batch {batch_num}/{n_batches} — {len(upserts)} OK")
                except Exception as e:
                    print(f"  [PRICE] Batch {batch_num}/{n_batches} — DB error: {e}")
            else:
                print(f"  [PRICE] Batch {batch_num}/{n_batches} — no valid data")

        if group_start + workers < n_batches:
            time.sleep(group_sleep)

    elapsed = time.time() - pass_start
    print(f"  Price pass complete — {total_upserted} records in {elapsed:.1f}s")
    return total_upserted


# ── Fundamentals (every 4 hours) ───────────────────────────────────────────────

def compute_avg_daily_chg(ticker: str) -> float:
    try:
        hist = yf.Ticker(ticker).history(period="1mo")
        if len(hist) >= 2:
            return round(float(hist["Close"].pct_change().dropna().abs().mean() * 100), 4)
    except Exception:
        pass
    return 0.0


def run_fundamentals_pass(tickers: list):
    print("  [FUNDAMENTALS] Starting pass...")
    total = 0
    n_batches = (len(tickers) + FUND_BATCH - 1) // FUND_BATCH

    for i in range(0, len(tickers), FUND_BATCH):
        batch     = tickers[i:i + FUND_BATCH]
        batch_num = i // FUND_BATCH + 1
        upserts   = []

        for ticker in batch:
            try:
                info = yf.Ticker(ticker).info
                cp   = safe_float(info.get("currentPrice") or info.get("regularMarketPrice"))
                if cp == 0.0:
                    hist = yf.Ticker(ticker).history(period="1d")
                    if not hist.empty:
                        cp = safe_float(hist["Close"].iloc[-1])
                    else:
                        continue
                upserts.append({
                    "symbol":         ticker,
                    "name":           info.get("shortName", ticker),
                    "high52w":        safe_float(info.get("fiftyTwoWeekHigh")),
                    "low52w":         safe_float(info.get("fiftyTwoWeekLow")),
                    "bid":            safe_float(info.get("bid")),
                    "ask":            safe_float(info.get("ask")),
                    "market_cap":     safe_float(info.get("marketCap")),
                    "pe_ratio":       safe_float(info.get("trailingPE")),
                    "revenue_growth": safe_float(info.get("revenueGrowth")),
                    "close_price":    safe_float(
                        info.get("previousClose") or info.get("regularMarketPreviousClose")
                    ),
                    "avg_daily_chg":  compute_avg_daily_chg(ticker),
                    "updatedAt":      "now()",
                })
            except Exception:
                pass

        if upserts:
            try:
                supabase.table("stocks").upsert(upserts).execute()
                total += len(upserts)
                print(f"  [FUNDAMENTALS] Batch {batch_num}/{n_batches} — {len(upserts)} OK")
            except Exception as e:
                print(f"  [FUNDAMENTALS] Batch {batch_num}/{n_batches} — DB error: {e}")

        time.sleep(FUND_SLEEP)

    print(f"  [FUNDAMENTALS] Done — {total} records updated.")


# ── End-of-day history flush ───────────────────────────────────────────────────

def write_history_for_all(tickers: list):
    print("  [HISTORY] End-of-day flush starting...")
    today_str = datetime.now(pytz.timezone("US/Central")).strftime("%Y-%m-%d")

    for i in range(0, len(tickers), PRICE_BATCH):
        batch = tickers[i:i + PRICE_BATCH]
        try:
            prices_res  = supabase.table("stocks").select("symbol, price").in_("symbol", batch).execute()
            history_res = supabase.table("stock_history").select("symbol, prices").in_("symbol", batch).execute()

            current_prices = {r["symbol"]: r.get("price", 0.0) for r in (prices_res.data or [])}
            history_dict   = {r["symbol"]: r.get("prices", [])  for r in (history_res.data or [])}

            upserts = []
            for sym in batch:
                if sym not in current_prices:
                    continue
                hp = history_dict.get(sym, [])
                cp = current_prices[sym]
                if hp and hp[-1].get("date") == today_str:
                    hp[-1]["price"] = cp
                else:
                    hp.append({"date": today_str, "price": cp})
                upserts.append({
                    "symbol":    sym,
                    "prices":    hp[-MAX_HISTORY_POINTS:],
                    "updatedAt": "now()",
                })

            if upserts:
                supabase.table("stock_history").upsert(upserts).execute()
        except Exception as e:
            print(f"  [HISTORY] Batch error: {e}")

        time.sleep(1)

    print("  [HISTORY] Flush complete.")


# ── Main loop ──────────────────────────────────────────────────────────────────

def main():
    global history_written_today, current_date_str, last_fundamentals_time

    tickers = get_all_tickers()
    last_fundamentals_time = time.time()  # defer first fundamentals run by 4h

    print("Entering continuous price-update loop...\n")
    while True:
        cst        = pytz.timezone("US/Central")
        now_cst    = datetime.now(cst)
        today_date = now_cst.strftime("%Y-%m-%d")

        if today_date != current_date_str:
            current_date_str      = today_date
            history_written_today = False
            # Re-fetch tickers daily to pick up new listings.
            tickers = get_all_tickers()

        market_open = is_market_open()

        print(
            f"[CYCLE] {now_cst.strftime('%H:%M:%S')} | "
            f"market={'OPEN' if market_open else 'CLOSED'} | "
            f"tickers={len(tickers)}"
        )

        run_price_pass(tickers, market_open)

        if time.time() - last_fundamentals_time >= FUND_INTERVAL_SEC:
            run_fundamentals_pass(tickers)
            last_fundamentals_time = time.time()

        if market_closed_for_day() and not history_written_today:
            write_history_for_all(tickers)
            history_written_today = True


if __name__ == "__main__":
    main()
