"use client";

import Link from "next/link";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { ChatCanvas } from "../components/chat/ChatCanvas";
import { ChatComposer } from "../components/chat/ChatComposer";
import { ChatSidebar } from "../components/chat/ChatSidebar";
import { MainHeader } from "../components/MainHeader";

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
  const { user } = useUser();
  const [searchValue, setSearchValue] = useState("");

  return (
    <main className="flex h-screen flex-col bg-zinc-100">
      <MainHeader />

      <div className="flex min-h-0 flex-1">
        <ChatSidebar
          userName={user?.firstName || "User"}
          userStatus="Online"
          sectionTitle="GROUPS"
          searchPlaceholder="Search groups..."
          chats={groups}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onSearchSubmit={() => { }}
          searchHistory={[]}
          onHistorySelect={setSearchValue}
          onChatSelect={() => { }}
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