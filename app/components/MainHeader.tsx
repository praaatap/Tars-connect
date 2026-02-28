"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";

export function MainHeader() {
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
                        <Link href="/group-chat" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition-colors">
                            Groups
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
                        <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                            Sign In
                        </button>
                    </SignInButton>
                </Unauthenticated>
            </div>
        </header>
    );
}
