'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code)
        .then(() => router.replace('/'))
        .catch(() => router.replace('/auth'));
    } else {
      router.replace('/');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default function AuthCallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-warm-white dark:bg-[#1a1f1a]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary dark:border-mint border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#6b7280] dark:text-[#8fa887]">Signing you in...</p>
      </div>
      <Suspense>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
