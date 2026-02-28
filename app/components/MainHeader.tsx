"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";

export function MainHeader() {
    const pendingInvites = useQuery((api as any).messages.getPendingInvites, {});
    const inviteCount = pendingInvites?.length || 0;

    return (
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-3 shrink-0 z-50">
            <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2 text-lg font-bold text-indigo-600">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-sm">
                        💬
                    </span>
                    Tars Connect
                </Link>
                <Authenticated>
                    <nav className="hidden sm:flex items-center gap-4">
                        <Link href="/chat" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition-colors">
                            Chat
                        </Link>

                    </nav>
                </Authenticated>
            </div>
            <div className="flex items-center gap-3">
                <Authenticated>
                    <UserButton afterSignOutUrl="/" />
                </Authenticated>
                <Unauthenticated>
                    <SignInButton mode="modal">
                        <button className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                            Sign In
                        </button>
                    </SignInButton>
                </Unauthenticated>
            </div>
        </header>
    );
}
