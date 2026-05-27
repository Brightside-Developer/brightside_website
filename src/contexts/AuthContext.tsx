'use client';

import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

// Read the stored Supabase session from localStorage synchronously so the
// navbar can render the correct auth state on the very first paint without
// waiting for the async getSession() network verification.
function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = Object.keys(localStorage).find(
      k => k.startsWith('sb-') && k.endsWith('-auth-token')
    );
    if (!key) return null;
    const stored = JSON.parse(localStorage.getItem(key) ?? '{}');
    const expiresAt: number | undefined = stored?.expires_at;
    if (expiresAt && expiresAt * 1000 < Date.now()) return null;
    return (stored?.user as User) ?? null;
  } catch {
    return null;
  }
}

interface Profile {
  photo_url?: string;
  full_name?: string;
  preferences?: Record<string, unknown>;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  supabase: typeof supabase | null;
  authLoading: boolean;
  adminLoading: boolean;
  isAdmin: boolean;
  isBanned: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  savePreference: (key: string, value: unknown) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  supabase: null,
  authLoading: true,
  adminLoading: true,
  isAdmin: false,
  isBanned: false,
  signOut: async () => {},
  refreshProfile: async () => {},
  savePreference: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Start null/true so server and client initial renders match (no hydration mismatch).
  // useLayoutEffect syncs from localStorage before the browser paints, giving instant auth UI.
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [adminLoading, setAdminLoading] = useState<boolean>(true);

  useLayoutEffect(() => {
    const stored = getStoredUser();
    if (stored) setUser(stored);
    // Always clear authLoading before paint so the navbar never stays blank.
    // getSession() will update user state asynchronously if needed.
    setAuthLoading(false);
  }, []);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isBanned, setIsBanned] = useState<boolean>(false);

  const applyPreferences = (prefs: Record<string, unknown>) => {
    if (prefs.dark_mode === true) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else if (prefs.dark_mode === false) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('photo_url, full_name, preferences')
        .eq('id', userId)
        .single();
      if (!error && data) {
        setProfile(data);
        if (data.preferences) applyPreferences(data.preferences as Record<string, unknown>);
      } else {
        setProfile(null);
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
      setProfile(null);
    }
  };

  const savePreference = async (key: string, value: unknown) => {
    if (!user) return;
    const updated = { ...(profile?.preferences ?? {}), [key]: value };
    setProfile(prev => prev ? { ...prev, preferences: updated } : prev);
    await supabase.from('profiles').update({ preferences: updated }).eq('id', user.id);
  };

  const checkAdminAndBan = async (userId: string) => {
    // Guard each query with a timeout so a slow/cold DB can never leave
    // adminLoading stuck true (which would hide admin-gated pages forever).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const withTimeout = (p: PromiseLike<any>) =>
      Promise.race([Promise.resolve(p), new Promise<any>(r => setTimeout(() => r({ data: null, error: null }), 8000))]);
    const [adminRes, banRes] = await Promise.all([
      withTimeout(supabase.from('admin_users').select('user_id').eq('user_id', userId).maybeSingle()),
      withTimeout(supabase.from('banned_users').select('user_id').eq('user_id', userId).maybeSingle()),
    ]);
    if (adminRes.error) console.error('[auth] admin_users query error:', adminRes.error);
    if (banRes.error)   console.error('[auth] banned_users query error:', banRes.error);
    setIsAdmin(!!adminRes.data);
    setIsBanned(!!banRes.data);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (session?.user) {
        fetchProfile(session.user.id);
        await checkAdminAndBan(session.user.id);
      }
      setAdminLoading(false);
    }).catch(() => {
      setAuthLoading(false);
      setAdminLoading(false);
    });

    // IMPORTANT: this callback runs while supabase-js holds the auth lock.
    // Awaiting any supabase .from()/.rpc() call here deadlocks — those calls
    // need the same lock to attach the token, so they wait on a lock we're
    // still holding. The whole app's queries then stall until they time out.
    // Keep this callback synchronous and defer DB work so the lock releases.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        setAuthLoading(false);
        setAdminLoading(true); // hold open while we re-check admin status
        const uid = currentSession.user.id;
        setTimeout(() => {
          fetchProfile(uid);
          checkAdminAndBan(uid).finally(() => setAdminLoading(false));
        }, 0);
      } else {
        setProfile(null);
        setIsAdmin(false);
        setIsBanned(false);
        setAuthLoading(false);
        setAdminLoading(false);
      }
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  const signOut = async () => {
    // Race the API call against a 3s timeout — if Supabase's server is slow or
    // the token is already expired, the await would hang forever and the button
    // would appear to do nothing. The timeout guarantees logout always completes.
    await Promise.race([
      supabase.auth.signOut().catch(() => {}),
      new Promise<void>(resolve => setTimeout(resolve, 3000)),
    ]);
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
    setIsBanned(false);
    // Wipe all Supabase localStorage keys so getStoredUser() returns null on
    // the next page load even if the API call didn't clear them.
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('sb-'))
        .forEach(k => localStorage.removeItem(k));
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, supabase, authLoading, adminLoading, isAdmin, isBanned, signOut, refreshProfile, savePreference }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
