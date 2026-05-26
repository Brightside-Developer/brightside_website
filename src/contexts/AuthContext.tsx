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
    const [{ data: adminRow }, { data: banRow }] = await Promise.all([
      supabase.from('admin_users').select('user_id').eq('user_id', userId).maybeSingle(),
      supabase.from('banned_users').select('user_id').eq('user_id', userId).maybeSingle(),
    ]);
    setIsAdmin(!!adminRow);
    setIsBanned(!!banRow);
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
        setAuthLoading(false);
        await checkAdminAndBan(currentSession.user.id);
      } else {
        setProfile(null);
        setIsAdmin(false);
        setIsBanned(false);
        setAuthLoading(false);
      }
      setAdminLoading(false);
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error signing out:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, supabase, authLoading, adminLoading, isAdmin, isBanned, signOut, refreshProfile, savePreference }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
