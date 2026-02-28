"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ChatCanvas } from "../components/chat/ChatCanvas";
import { ChatComposer } from "../components/chat/ChatComposer";
import { ChatSidebar } from "../components/chat/ChatSidebar";

const groups = [
  {
    name: "Design Team",
    message: "Anna: Sharing final mockups in 10 min.",
    time: "4m",
    unreadCount: 5,
    active: true,
  },
  { name: "Engineering", message: "Build passed on main branch.", time: "22m" },
  { name: "Marketing", message: "Campaign deck updated.", time: "1h" },
  { name: "Intern Challenge 2026", message: "Submission form is live.", time: "3h" },
];

export default function GroupChatPage() {
  return (
    <main className="flex h-screen flex-col bg-zinc-100">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-zinc-900">Tars Group Chat</h1>
          <Link href="/chat" className="text-sm text-indigo-600 hover:text-indigo-500">
            Direct Chat
          </Link>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="flex min-h-0 flex-1">
        <ChatSidebar
          userName="Alex Tars"
          userStatus="Online"
          sectionTitle="GROUPS"
          searchPlaceholder="Search groups..."
          chats={groups}
        />
        <div className="flex min-h-0 flex-1 flex-col">
          <ChatCanvas
            title="Welcome to Group Spaces"
            subtitle="Pick a group from the left panel to view conversations with your team."
            buttonText="Create Group"
            hintText="Press ⌘ K to jump between groups"
          />
          <ChatComposer placeholder="Type a message to your group..." />
        </div>
      </div>
    </main>
  );
}