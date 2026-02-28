"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ChatCanvas } from "../components/chat/ChatCanvas";
import { ChatComposer } from "../components/chat/ChatComposer";
import { ChatSidebar } from "../components/chat/ChatSidebar";

const chats = [
  {
    name: "Sarah Connor",
    message: "Hey! Did you see the new design?",
    time: "2m",
    unreadCount: 2,
    active: true,
  },
  { name: "Michael Chen", message: "Can we reschedule the meeting?", time: "1h" },
  { name: "David Kim", message: "Thanks for the update!", time: "3h" },
  { name: "Emily Davis", message: "Perfect, see you then.", time: "1d" },
];

export default function ChatPage() {
  return (
    <main className="flex h-screen flex-col bg-zinc-100">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-zinc-900">Tars Chat</h1>
          <Link href="/group-chat" className="text-sm text-indigo-600 hover:text-indigo-500">
            Group Chat
          </Link>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="flex min-h-0 flex-1">
        <ChatSidebar
          userName="Alex Tars"
          userStatus="Online"
          sectionTitle="MESSAGES"
          searchPlaceholder="Search people..."
          chats={chats}
        />
        <div className="flex min-h-0 flex-1 flex-col">
          <ChatCanvas
            title="Welcome to Tars Chat"
            subtitle="Select a conversation from the sidebar to start messaging or search for a new contact."
            buttonText="New Message"
            hintText="Press ⌘ K to search"
          />
          <ChatComposer placeholder="Select a chat to start typing..." />
        </div>
      </div>
    </main>
  );
}