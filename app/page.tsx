"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8 px-8 py-16">
        {/* Header */}
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Tars Connect
          </h1>
          <Authenticated>
            <UserButton afterSignOutUrl="/" />
          </Authenticated>
        </div>

        {/* Main Content */}
        <div className="flex w-full flex-col items-center gap-6 rounded-2xl bg-white p-12 shadow-xl dark:bg-zinc-800">
          <AuthLoading>
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-50"></div>
              <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
            </div>
          </AuthLoading>

          <Unauthenticated>
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="rounded-full bg-zinc-100 p-6 dark:bg-zinc-700">
                <svg
                  className="h-16 w-16 text-zinc-700 dark:text-zinc-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  Welcome to Tars Connect
                </h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                  Sign in to access your account and connect with team members
                </p>
              </div>
              <SignInButton mode="modal">
                <button className="mt-4 rounded-lg bg-zinc-900 px-8 py-3 text-lg font-semibold text-white transition-all hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </Unauthenticated>

          <Authenticated>
            <AuthenticatedContent />
          </Authenticated>
        </div>
      </main>
    </div>
  );
}

function AuthenticatedContent() {
  const { user } = useUser();

  return (
    <div className="flex w-full flex-col items-center gap-6 text-center">
      <div className="rounded-full bg-green-100 p-6 dark:bg-green-900">
        <svg
          className="h-16 w-16 text-green-700 dark:text-green-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Welcome back, {user?.firstName || "User"}! 👋
        </h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          You're successfully authenticated with Clerk & Convex
        </p>
      </div>
      <div className="mt-4 w-full space-y-3 rounded-lg bg-zinc-50 p-6 text-left dark:bg-zinc-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Email:
          </span>
          <span className="text-sm text-zinc-900 dark:text-zinc-100">
            {user?.primaryEmailAddress?.emailAddress}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            User ID:
          </span>
          <span className="text-sm font-mono text-zinc-900 dark:text-zinc-100">
            {user?.id.slice(0, 20)}...
          </span>
        </div>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-500">
        🎉 Your Convex backend can now access your authenticated user data
      </p>
    </div>
  );
}
