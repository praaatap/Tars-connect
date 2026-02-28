"use client";

import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { AuthLoading, Authenticated, Unauthenticated } from "convex/react";

export default function Home() {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-zinc-100 lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-indigo-600 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-size-[72px_72px]" />
        <div className="relative z-10 flex items-center gap-2 text-lg font-semibold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            💬
          </span>
          Tars Social
        </div>
        <div className="relative z-10 max-w-xl space-y-6">
          <h1 className="text-6xl font-bold leading-[1.05] tracking-tight">
            Connect instantly. Collaborate effortlessly.
          </h1>
          <p className="max-w-lg text-2xl text-white/90">
            A polished, real-time messaging interface built for modern teams.
          </p>
          <div className="inline-flex items-center gap-4 rounded-full bg-white/10 px-5 py-3">
            <div className="flex -space-x-2">
              <span className="h-8 w-8 rounded-full border-2 border-indigo-500 bg-indigo-200" />
              <span className="h-8 w-8 rounded-full border-2 border-indigo-500 bg-indigo-100" />
              <span className="h-8 w-8 rounded-full border-2 border-indigo-500 bg-indigo-50" />
            </div>
            <div>
              <p className="text-xs text-yellow-300">★★★★★</p>
              <p className="text-sm text-white/90">Active developers</p>
            </div>
          </div>
        </div>
        <div className="relative z-10 flex gap-6 text-sm text-white/80">
          <span>© 2026 Tars Inc.</span>
          <Link href="/privacy-policy" className="hover:text-white">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:text-white">
            Terms of Service
          </Link>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <AuthLoading>
            <p className="text-center text-sm text-zinc-500">Loading auth...</p>
          </AuthLoading>

          <Unauthenticated>
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-zinc-900">Welcome back</h2>
                <p className="mt-2 text-zinc-500">Please sign in to continue.</p>
              </div>

              <div className="space-y-3">
                <SignInButton mode="modal">
                  <button className="w-full rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                    Continue with Google
                  </button>
                </SignInButton>
                <SignInButton mode="modal">
                  <button className="w-full rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                    Continue with GitHub
                  </button>
                </SignInButton>
              </div>

              <SignInButton mode="modal">
                <button className="w-full rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500">
                  Sign in
                </button>
              </SignInButton>
            </div>
          </Unauthenticated>

          <Authenticated>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-zinc-900">You are signed in</h2>
                <UserButton afterSignOutUrl="/" />
              </div>
              <div className="grid gap-3">
                <Link
                  href="/chat"
                  className="rounded-xl border border-zinc-200 px-4 py-3 text-center font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Open Chat Page
                </Link>
                <Link
                  href="/group-chat"
                  className="rounded-xl border border-zinc-200 px-4 py-3 text-center font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Open Group Chat Page
                </Link>
              </div>
            </div>
          </Authenticated>
        </div>
      </section>
    </main>
  );
}
