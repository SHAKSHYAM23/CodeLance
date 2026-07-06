'use client';

import { useEffect } from 'react';
import { logout } from '@/lib/api';

export default function LogoutPage() {
  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
      } catch (error) {
        console.error('[CodeLance] Logout error:', error);
      } finally {
        // Always redirect to home
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
    };

    performLogout();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block">
          <div className="w-8 h-8 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-[#8b949e] mt-4">Signing out...</p>
      </div>
    </div>
  );
}
