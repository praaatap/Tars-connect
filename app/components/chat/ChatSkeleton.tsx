import { MainHeader } from "../MainHeader";

export function ChatSkeleton() {
    return (
        <main className="flex h-screen flex-col bg-zinc-50">
            <MainHeader />
            <div className="flex flex-1 min-h-0">
                <div className="hidden lg:flex w-[320px] flex-col border-r border-zinc-200 bg-white p-4 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="flex gap-3">
                            <div className="h-10 w-10 bg-zinc-100 rounded-full animate-pulse" />
                            <div className="flex-1 space-y-2 py-1">
                                <div className="h-4 bg-zinc-100 rounded animate-pulse w-3/4" />
                                <div className="h-3 bg-zinc-50 rounded animate-pulse w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex-1 bg-[#efeae2]/50" />
            </div>
        </main>
    );
}
