"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://dummy.convex.cloud";
const convex = new ConvexReactClient(CONVEX_URL);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-50 p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Missing Convex Configuration</h1>
        <p className="text-zinc-600 max-w-md">
          The <code>NEXT_PUBLIC_CONVEX_URL</code> environment variable is missing.
          If you are deploying to Vercel, please add this variable in your project settings or install the Convex Vercel Integration.
        </p>
      </div>
    );
  }

  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
