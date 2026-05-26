'use client';

import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Theme = 'light' | 'dark';

export default function SettingsPage() {
  const { user, authLoading, savePreference } = useContext(AuthContext);
  const [theme, setTheme] = useState<Theme>('light');

  // Load theme: prefer DB value, fall back to localStorage
  useEffect(() => {
    if (!user) {
      const stored = localStorage.getItem('darkMode');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(stored === 'true' ? 'dark' : 'light');
      return;
    }
    supabase.from('profiles').select('preferences').eq('id', user.id).single().then(({ data }) => {
      const prefs = data?.preferences as Record<string, unknown> | null;
      if (prefs && typeof prefs.dark_mode === 'boolean') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTheme(prefs.dark_mode ? 'dark' : 'light');
      } else {
        const stored = localStorage.getItem('darkMode');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTheme(stored === 'true' ? 'dark' : 'light');
      }
    });
  }, [user]);

  const applyTheme = (next: Theme) => {
    setTheme(next);
    const isDark = next === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
    savePreference('dark_mode', isDark);
  };

  useEffect(() => {
    if (!authLoading && !user) window.location.href = '/auth';
  }, [authLoading, user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (authLoading) return (
    <div className="flex flex-col flex-1 bg-warm-white dark:bg-[#1a1f1a] px-6 py-20 md:px-16">
      <div className="max-w-[520px] mx-auto w-full animate-pulse">
        <div className="mb-8">
          <div className="h-2.5 w-20 bg-primary/10 dark:bg-mint/10 rounded mb-2.5" />
          <div className="h-8 w-32 bg-primary/10 dark:bg-mint/10 rounded" />
        </div>
        {[0, 1].map(i => (
          <div key={i} className="bg-white dark:bg-[#242924] border border-primary/6 dark:border-mint/10 rounded-[20px] p-7 shadow-sm mb-4">
            <div className="h-3.5 w-28 bg-primary/10 dark:bg-mint/10 rounded mb-2" />
            <div className="h-2.5 w-52 bg-primary/6 dark:bg-mint/6 rounded mb-5" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-28 bg-primary/6 dark:bg-mint/6 rounded-2xl" />
              <div className="h-28 bg-primary/6 dark:bg-mint/6 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 bg-warm-white dark:bg-[#1a1f1a] px-6 py-20 md:px-16">
      <div className="max-w-[520px] mx-auto w-full">

        <div className="mb-8">
          <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-primary-light dark:text-mint block mb-2">Preferences</span>
          <h1 className="font-serif text-3xl font-black text-primary dark:text-[#e8f0e0]">Settings</h1>
        </div>

        {/* ── Theme picker ─────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#242924] border border-primary/6 dark:border-mint/10 rounded-[20px] p-7 shadow-sm mb-4">
          <h3 className="font-semibold text-sm text-primary dark:text-[#e8f0e0] mb-0.5">Appearance</h3>
          <p className="text-xs text-[#6b7280] dark:text-[#8fa887] mb-5">Choose how Brightside looks to you.</p>

          <div className="grid grid-cols-2 gap-3">

            {/* Light card */}
            <button
              onClick={() => applyTheme('light')}
              className={`rounded-2xl border-2 p-3 text-left transition-all duration-200 cursor-pointer group ${
                theme === 'light'
                  ? 'border-primary dark:border-mint shadow-sm'
                  : 'border-primary/10 dark:border-mint/10 hover:border-primary/25 dark:hover:border-mint/25'
              }`}
            >
              {/* Mini preview */}
              <div className="bg-[#f7f3eb] rounded-xl mb-3 p-3 h-[72px] overflow-hidden relative">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[#1a4820]" />
                  <div className="h-1.5 w-10 rounded-full bg-[#1a4820]/30" />
                </div>
                <div className="h-2 w-4/5 rounded-full bg-[#1a4820]/20 mb-1.5" />
                <div className="h-1.5 w-3/5 rounded-full bg-[#1a4820]/12" />
                <div className="absolute bottom-2 right-2">
                  <div className="h-4 w-10 rounded-full bg-[#52b87a]/25" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">☀️</span>
                  <span className="font-bold text-xs text-primary dark:text-[#e8f0e0]">Light</span>
                </div>
                {theme === 'light' && (
                  <span className="w-4 h-4 rounded-full bg-primary dark:bg-mint flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white dark:text-[#1a1f1a]" fill="none" viewBox="0 0 10 10">
                      <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </div>
            </button>

            {/* Dark card */}
            <button
              onClick={() => applyTheme('dark')}
              className={`rounded-2xl border-2 p-3 text-left transition-all duration-200 cursor-pointer group ${
                theme === 'dark'
                  ? 'border-primary dark:border-mint shadow-sm'
                  : 'border-primary/10 dark:border-mint/10 hover:border-primary/25 dark:hover:border-mint/25'
              }`}
            >
              {/* Mini preview */}
              <div className="bg-[#1a1f1a] rounded-xl mb-3 p-3 h-[72px] overflow-hidden relative">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[#52b87a]" />
                  <div className="h-1.5 w-10 rounded-full bg-[#52b87a]/30" />
                </div>
                <div className="h-2 w-4/5 rounded-full bg-[#e8f0e0]/20 mb-1.5" />
                <div className="h-1.5 w-3/5 rounded-full bg-[#e8f0e0]/12" />
                <div className="absolute bottom-2 right-2">
                  <div className="h-4 w-10 rounded-full bg-[#52b87a]/20" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">🌙</span>
                  <span className="font-bold text-xs text-primary dark:text-[#e8f0e0]">Dark</span>
                </div>
                {theme === 'dark' && (
                  <span className="w-4 h-4 rounded-full bg-primary dark:bg-mint flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white dark:text-[#1a1f1a]" fill="none" viewBox="0 0 10 10">
                      <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </div>
            </button>

          </div>
        </div>

        {/* ── Sign out ─────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#242924] border border-primary/6 dark:border-mint/10 rounded-[20px] p-7 shadow-sm mb-6">
          <h3 className="font-semibold text-sm text-primary dark:text-[#e8f0e0] mb-1">Sign Out</h3>
          <p className="text-xs text-[#6b7280] dark:text-[#8fa887] mb-5">You will be redirected to the home page.</p>
          <button
            onClick={handleSignOut}
            className="font-bold text-sm px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all cursor-pointer shadow-sm hover:shadow-md"
          >
            Sign Out
          </button>
        </div>

        <Link
          href="/account"
          className="inline-flex items-center font-semibold text-sm text-primary-light dark:text-mint hover:text-primary dark:hover:text-cream transition-colors"
        >
          ← Back to Account
        </Link>

      </div>
    </div>
  );
}
