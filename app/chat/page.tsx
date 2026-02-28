"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Authenticated, AuthLoading } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ChatCanvas } from "../components/chat/ChatCanvas";
import { ChatComposer } from "../components/chat/ChatComposer";
import { ChatSidebar } from "../components/chat/ChatSidebar";
import { ChatRightSidebar } from "../components/chat/ChatRightSidebar";

export default function ChatPage() {
  return (
    <Authenticated>
      <ChatContent />
    </Authenticated>
  );
}

function LoadingScreen() {
  return (
    <main className="flex h-screen flex-col items-center justify-center bg-zinc-100">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600"></div>
        <p className="text-zinc-600">Loading your chats...</p>
      </div>
    </main>
  );
}

function ChatContent() {
  const { user } = useUser();
  const [searchValue, setSearchValue] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Initialize user in database on first load
  const initializeUser = useMutation((api as any).messages.initializeUser);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  // Fetch real conversations from Convex
  const conversations = useQuery((api as any).messages.getConversations, {});
  const searchHistory = useQuery(api.searchHistory.getForCurrentUser, {});

  // Real-time user search
  const userSearchResults = useQuery(
    searchValue.trim() !== "" ? (api as any).users.searchUsers : "skip",
    searchValue.trim() !== "" ? { query: searchValue } : "skip"
  );

  // Fetch messages for selected conversation
  const messages = useQuery(
    selectedConversationId ? (api as any).messages.getMessagesForConversation : "skip",
    selectedConversationId ? { conversationId: selectedConversationId as any } : "skip"
  );

  const addSearchHistory = useMutation(api.searchHistory.addForCurrentUser);
  const sendMessage = useMutation((api as any).messages.sendMessage);
  const getOrCreateConversation = useMutation((api as any).messages.getOrCreateConversation);

  const handleSearchSubmit = async () => {
    const normalized = searchValue.trim();
    if (!normalized) return;
    await addSearchHistory({ query: normalized });
  };

  const handleHistorySelect = async (value: string) => {
    setSearchValue(value);
    await addSearchHistory({ query: value });
  };

  const handleSelectChat = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setSearchValue(""); // Clear search when selecting a chat
  };

  const handleSelectUser = async (userId: string) => {
    const conversationId = await getOrCreateConversation({ otherUserId: userId as any });
    setSelectedConversationId(conversationId);
    setSearchValue(""); // Clear search
  };

  const handleSendMessage = async (messageBody: string) => {
    if (!selectedConversationId || !messageBody.trim()) return;
    await sendMessage({
      conversationId: selectedConversationId as any,
      body: messageBody,
    });
  };

  // Convert search results to sidebar format
  const searchItems = (userSearchResults ?? []).map((u: any) => ({
    name: u.name || "User",
    message: u.email || "",
    time: "",
    conversationId: u._id, // Using userId as ID for mapping
    isUser: true,
  }));

  // Convert conversations to sidebar format
  const chatItems = (conversations ?? []).map((conv: any) => {
    const timeAgo = formatMessageTimestamp(conv.lastMessageAt);
    return {
      name: conv.name,
      message: conv.lastMessage || "No messages yet",
      time: timeAgo,
      active: selectedConversationId === conv._id,
      conversationId: conv._id,
      isUser: false,
    };
  });

  const displayItems = searchValue.trim() !== "" ? searchItems : chatItems;

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
          userName={user?.firstName || "User"}
          userStatus="Online"
          sectionTitle={searchValue.trim() !== "" ? "SEARCH RESULTS" : "MESSAGES"}
          searchPlaceholder="Search people..."
          chats={displayItems as any}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onSearchSubmit={handleSearchSubmit}
          searchHistory={searchHistory ?? []}
          onHistorySelect={handleHistorySelect}
          onChatSelect={(id) => {
            const item = displayItems.find((i: any) => i.conversationId === id);
            if (item?.isUser) {
              handleSelectUser(id);
            } else {
              handleSelectChat(id);
            }
          }}
        />
        <div className="flex min-h-0 flex-1 flex-col">
          {selectedConversationId && messages ? (
            <ChatWindow
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <>
              <ChatCanvas
                title="Welcome to Tars Chat"
                subtitle="Select a conversation from the sidebar to start messaging or search for a new contact."
                buttonText="New Message"
                hintText="Press ⌘ K to search"
              />
              <ChatComposer placeholder="Select a chat to start typing..." disabled />
            </>
          )}
        </div>
        <ChatRightSidebar onChatSelect={handleSelectChat} />
      </div>
    </main>
  );
}

function ChatWindow({
  messages,
  onSendMessage,
}: {
  messages: any[];
  onSendMessage: (message: string) => void;
}) {
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    await onSendMessage(input);
    setInput("");
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-white p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center text-2xl">
              👋
            </div>
            <div className="max-w-xs">
              <p className="text-zinc-900 font-medium">No messages yet</p>
              <p className="text-zinc-500 text-sm mt-1">Start the conversation by sending a message below!</p>
            </div>
          </div>
        ) : (
          messages.map((msg: any) => (
            <div key={msg._id} className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-indigo-200 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-900">{msg.sender.name}</p>
                <p className="text-sm text-zinc-700 mt-1">{msg.body}</p>
                <p className="text-xs text-zinc-400 mt-1">{formatMessageTimestamp(msg.createdAt)}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="border-t border-zinc-200 bg-white px-5 py-4">
        <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2.5">
          <input
            className="flex-1 bg-transparent text-sm text-zinc-700 outline-none"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs text-white"
          >
            ➤
          </button>
        </div>
      </div>
    </>
  );
}

function formatMessageTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const isSameYear = date.getFullYear() === now.getFullYear();

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };

  if (isToday) {
    return date.toLocaleTimeString('en-US', timeOptions);
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    ...timeOptions
  };

  if (isSameYear) {
    return date.toLocaleTimeString('en-US', dateOptions);
  }

  return date.toLocaleTimeString('en-US', {
    ...dateOptions,
    year: 'numeric'
  });
}