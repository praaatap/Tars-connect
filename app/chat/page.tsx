"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
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

  // Fetch current user from Convex
  const currentUser = useQuery((api as any).users.getCurrentUser, {});

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
  const updatePresence = useMutation((api as any).users.updatePresence);
  const markAsRead = useMutation((api as any).messages.markAsRead);

  // Presence heartbeat
  useEffect(() => {
    updatePresence();
    const interval = setInterval(() => {
      updatePresence();
    }, 15000); // Every 15 seconds
    return () => clearInterval(interval);
  }, [updatePresence]);

  // Mark as read when selecting or receiving messages
  useEffect(() => {
    if (selectedConversationId) {
      markAsRead({ conversationId: selectedConversationId as any });
    }
  }, [selectedConversationId, messages, markAsRead]);

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
    isOnline: u.lastSeenAt ? (Date.now() - u.lastSeenAt) < 60000 : false,
    imageUrl: u.imageUrl,
  }));

  // Convert conversations to sidebar format
  const chatItems = (conversations ?? []).map((conv: any) => {
    const timeAgo = formatMessageTimestamp(conv.lastMessageAt);
    const isOnline = conv.lastSeenAt ? (Date.now() - conv.lastSeenAt) < 60000 : false;

    return {
      name: conv.name,
      message: conv.lastMessage || "No messages yet",
      time: timeAgo,
      active: selectedConversationId === conv._id,
      conversationId: conv._id,
      isUser: false,
      isOnline,
      unreadCount: conv.unreadCount || 0,
      imageUrl: conv.imageUrl,
    };
  });

  const displayItems = searchValue.trim() !== "" ? searchItems : chatItems;

  return (
    <main className="flex h-screen flex-col bg-zinc-100">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-zinc-900">Tars Chat</h1>
          <Link href="/group-chat" className="text-sm text-indigo-600 hover:text-indigo-500">
            Group Chat
          </Link>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="flex min-h-0 flex-1 relative overflow-hidden">
        {/* Sidebar - hidden on mobile when a chat is selected */}
        <div className={`w-full lg:w-[320px] lg:flex shrink-0 ${selectedConversationId ? 'hidden' : 'flex'}`}>
          <ChatSidebar
            userName={currentUser?.name || user?.firstName || "User"}
            userStatus="Online"
            imageUrl={currentUser?.imageUrl}
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
        </div>

        {/* Chat Window - takes full width on mobile when selected */}
        <div className={`flex min-h-0 flex-1 flex-col ${!selectedConversationId ? 'hidden lg:flex' : 'flex'}`}>
          {selectedConversationId && messages ? (
            <ChatWindow
              messages={messages}
              onSendMessage={handleSendMessage}
              onBack={() => setSelectedConversationId(null)}
              selectedConversation={conversations?.find((c: any) => c._id === selectedConversationId)}
              currentUserId={currentUser?._id}
            />
          ) : (
            <div className="hidden lg:flex flex-1 flex-col">
              <ChatCanvas
                title="Welcome to Tars Chat"
                subtitle="Select a conversation from the sidebar to start messaging or search for a new contact."
                buttonText="New Message"
                hintText="Press ⌘ K to search"
              />
              <ChatComposer placeholder="Select a chat to start typing..." disabled />
            </div>
          )}
        </div>

        {/* Right Sidebar - hidden on mobile */}
        <div className="hidden xl:block">
          <ChatRightSidebar onChatSelect={handleSelectChat} />
        </div>
      </div>
    </main>
  );
}

function ChatWindow({
  messages,
  onSendMessage,
  onBack,
  selectedConversation,
  currentUserId,
}: {
  messages: any[];
  onSendMessage: (message: string) => void;
  onBack: () => void;
  selectedConversation?: any;
  currentUserId?: string;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const setTyping = useMutation((api as any).messages.setTyping);
  const clearTyping = useMutation((api as any).messages.clearTyping);

  const handleTyping = () => {
    if (!selectedConversation?._id) return;
    setTyping({ conversationId: selectedConversation._id });
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    await onSendMessage(input);
    setInput("");
    if (selectedConversation?._id) {
      clearTyping({ conversationId: selectedConversation._id });
    }
    // Force scroll to bottom after sending
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 50;
    setIsAtBottom(atBottom);
    if (atBottom) setShowScrollButton(false);
  };

  useEffect(() => {
    if (isAtBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    } else if (messages.length > 0) {
      setShowScrollButton(true);
    }
  }, [messages, isAtBottom]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
      setShowScrollButton(false);
    }
  };

  return (
    <>
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 -ml-1 text-zinc-600 hover:text-zinc-900 lg:hidden"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="relative">
            {selectedConversation?.imageUrl ? (
              <img src={selectedConversation.imageUrl} alt={selectedConversation.name} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                {selectedConversation?.name?.[0] || 'C'}
              </div>
            )}
            {selectedConversation?.isOnline && (
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
            )}
          </div>
          <div>
            <span className="font-semibold text-zinc-900 block leading-tight">{selectedConversation?.name}</span>
            <span className="text-xs text-zinc-500">{selectedConversation?.isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-[#efeae2] p-4 lg:p-6 space-y-2 relative"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <div className="h-16 w-16 bg-white/50 backdrop-blur rounded-full flex items-center justify-center text-2xl shadow-sm">
              👋
            </div>
            <div className="max-w-xs">
              <p className="text-zinc-900 font-medium">No messages yet</p>
              <p className="text-zinc-500 text-sm mt-1">Start the conversation by sending a message below!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg: any) => {
              const isMine = msg.sender._id === currentUserId;
              return (
                <div
                  key={msg._id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}
                >
                  {!isMine && (
                    <div className="mr-2 mt-auto shrink-0">
                      {msg.sender.imageUrl ? (
                        <img src={msg.sender.imageUrl} alt={msg.sender.name} className="h-7 w-7 rounded-full object-cover" />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-indigo-200" />
                      )}
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] lg:max-w-[70%] rounded-2xl px-3 py-1.5 shadow-sm relative ${isMine
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white text-zinc-800 rounded-tl-none'
                      }`}
                  >
                    {!isMine && (
                      <p className="text-[11px] font-bold text-indigo-600 mb-0.5">{msg.sender.name}</p>
                    )}
                    <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{msg.body}</p>
                    <div className={`text-[10px] mt-1 flex justify-end ${isMine ? 'text-white/70' : 'text-zinc-400'}`}>
                      {formatMessageTimestamp(msg.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
            {selectedConversation?.isTyping && (
              <div className="flex gap-2 items-center text-zinc-500 text-[11px] animate-pulse ml-9">
                <div className="flex gap-1">
                  <span className="h-1 w-1 bg-zinc-400 rounded-full"></span>
                  <span className="h-1 w-1 bg-zinc-400 rounded-full"></span>
                  <span className="h-1 w-1 bg-zinc-400 rounded-full"></span>
                </div>
                <span>typing...</span>
              </div>
            )}
          </>
        )}

        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-lg transition-all hover:bg-indigo-700 active:scale-95 flex items-center gap-2 z-10"
          >
            ↓ New messages
          </button>
        )}
      </div>
      <div className="border-t border-zinc-200 bg-white px-4 py-3 shrink-0">
        <div className="flex items-center gap-2 rounded-2xl border border-zinc-100 bg-zinc-50 px-3 py-2">
          <input
            className="flex-1 bg-transparent text-[14px] text-zinc-700 outline-none"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm disabled:opacity-50 disabled:bg-zinc-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
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