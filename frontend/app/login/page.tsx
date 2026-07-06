'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050816] px-6">

      {/* Background */}
      <div className="absolute inset-0 grid-background opacity-25" />
      <div className="absolute inset-0 gradient-overlay opacity-60" />

      {/* Small Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-[#2563eb]/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">

        {/* Badge */}

        <div className="mb-8 flex justify-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-[#30363d] bg-[#0d1117]/80 px-4 py-2 backdrop-blur">

            <span className="h-2 w-2 rounded-full bg-[#58a6ff]" />

            <span className="text-sm text-[#9da7b3]">
              Secure Login
            </span>

          </div>

        </div>

        {/* Logo */}

        <div className="text-center mb-10">

          <h1 className="text-5xl font-black tracking-tight text-[#4f7cff]">
            CodeLance
          </h1>

          <p className="mt-3 text-[#8b949e] text-lg">
            Repository Intelligence for Developers
          </p>

        </div>

        {/* Card */}

        <div className="rounded-2xl border border-[#30363d] bg-[#0d1117]/90 p-8 backdrop-blur-xl shadow-[0_15px_50px_rgba(0,0,0,.45)]">

          <h2 className="text-center text-3xl font-bold text-white">
            Login
          </h2>

          <p className="mt-3 text-center leading-7 text-[#8b949e]">
            Sign in with your Google account to continue using
            <span className="font-semibold text-[#58a6ff]"> CodeLance</span>.
          </p>

          {/* Google Button */}

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="group mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-xl border border-[#30363d] bg-[#161b22] font-semibold text-white transition-all duration-300 hover:border-[#58a6ff]/50 hover:bg-[#1b2330] hover:shadow-[0_0_25px_rgba(88,166,255,.15)] disabled:cursor-not-allowed disabled:opacity-50"
          >

            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>

            {isLoading ? 'Redirecting...' : 'Sign in with Google'}
          </button>
                    {/* Features */}

          <div className="mt-8 border-t border-[#30363d] pt-6 space-y-4">

            <div className="flex items-center text-sm text-[#8b949e]">
              <span className="mr-3 text-[#58a6ff] text-base">✓</span>
              Secure Google Authentication
            </div>

            <div className="flex items-center text-sm text-[#8b949e]">
              <span className="mr-3 text-[#58a6ff] text-base">✓</span>
              Free to use
            </div>

            <div className="flex items-center text-sm text-[#8b949e]">
              <span className="mr-3 text-[#58a6ff] text-base">✓</span>
              No credit card required
            </div>

          </div>

        </div>

        {/* Back Button */}

        <div className="mt-8 text-center">

          <Link
            href="/"
            className="inline-flex items-center text-sm text-[#8b949e] hover:text-[#58a6ff] transition-colors"
          >
            ← Back to Home
          </Link>

          <p className="mt-4 text-xs text-[#6e7681]">
            Protected by Google OAuth 2.0
          </p>

        </div>

      </div>

    </div>
  );
}