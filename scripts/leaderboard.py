#!/usr/bin/env python3
"""
leaderboard.py — Pull and display leaderboards from Supabase.
Usage:
  python3 leaderboard.py          # main leaderboard
  python3 leaderboard.py comp     # competition leaderboard (prompts for comp ID)
  python3 leaderboard.py both     # both leaderboards
"""

import sys
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://evqlqsfapvjdwxcdybjm.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get(
    "SUPABASE_ANON_KEY", "sb_publishable_1ikE-564SUlEt2PqrEc39w_ZITnf02M"
)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def fmt_value(v):
    return f"${v:>12,.2f}" if v is not None else "           N/A"


def fmt_pct(p):
    if p is None:
        return "    N/A"
    sign = "+" if p >= 0 else ""
    return f"{sign}{p:>6.2f}%"


def print_main_leaderboard():
    print("\n── Main Leaderboard ─────────────────────────────────────────────")
    res = supabase.rpc("get_main_leaderboard").execute()
    rows = res.data or []
    if not rows:
        print("  No data.")
        return
    print(f"  {'#':<4} {'Name':<28} {'Total Value':>14} {'Return':>9}")
    print(f"  {'─'*4} {'─'*28} {'─'*14} {'─'*9}")
    for i, r in enumerate(rows, 1):
        name = (r.get("display_name") or "Anonymous")[:27]
        print(f"  {i:<4} {name:<28} {fmt_value(r.get('total_value'))} {fmt_pct(r.get('return_pct'))}")
    print(f"\n  {len(rows)} entries\n")


def print_competition_leaderboard(comp_id=None):
    if not comp_id:
        comps = supabase.table("competitions").select("id, name, status").execute().data or []
        if not comps:
            print("No competitions found.")
            return
        print("\nAvailable competitions:")
        for i, c in enumerate(comps):
            print(f"  {i+1}. [{c['status']}] {c['name']}  ({c['id']})")
        choice = input("\nEnter number or competition ID: ").strip()
        if choice.isdigit() and 1 <= int(choice) <= len(comps):
            comp_id = comps[int(choice) - 1]["id"]
            comp_name = comps[int(choice) - 1]["name"]
        else:
            comp_id = choice
            comp_name = comp_id

    print(f"\n── Competition Leaderboard: {comp_name if 'comp_name' in dir() else comp_id} ─────")
    res = supabase.rpc("get_competition_leaderboard", {"comp_id": comp_id}).execute()
    rows = res.data or []
    if not rows:
        print("  No data.")
        return
    print(f"  {'#':<4} {'Name':<28} {'Total Value':>14} {'Return':>9}")
    print(f"  {'─'*4} {'─'*28} {'─'*14} {'─'*9}")
    for i, r in enumerate(rows, 1):
        name = (r.get("display_name") or "Anonymous")[:27]
        print(f"  {i:<4} {name:<28} {fmt_value(r.get('total_value'))} {fmt_pct(r.get('return_pct'))}")
    print(f"\n  {len(rows)} entries\n")


mode = sys.argv[1] if len(sys.argv) > 1 else "main"

if mode in ("main", "both"):
    print_main_leaderboard()
if mode in ("comp", "both"):
    print_competition_leaderboard()
if mode not in ("main", "comp", "both"):
    print(f"Unknown mode '{mode}'. Use: main, comp, or both")
