"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Authenticated, AuthLoading } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ChatCanvas } from "../components/chat/ChatCanvas";
import { ChatComposer } from "../components/chat/ChatComposer";
import { ChatSidebar } from "../components/chat/ChatSidebar";
import { ChatRightSidebar } from "../components/chat/ChatRightSidebar";
import { GroupInvitesPanel } from "../components/chat/GroupInvitesPanel";
import { GroupMembersModal } from "../components/chat/GroupMembersModal";
import { SettingsModal } from "../components/chat/SettingsModal";
import { AISuggestionsModal } from "../components/chat/AISuggestionsModal";
import { MainHeader } from "../components/MainHeader";
import { useUIStore } from "../store/useUIStore";

export default function ChatPage() {
  return (
    <>
      <Authenticated>
        <ChatContent />
      </Authenticated>
      <AuthLoading>
        <ChatSkeleton />
      </AuthLoading>
    </>
  );
}

function ChatSkeleton() {
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

function LoadingScreen() {
  return <ChatSkeleton />;
}

function ChatContent() {
  const { user } = useUser();
  const [searchValue, setSearchValue] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const {
    sidebarWidth,
    setSidebarWidth,
    uiScale,
    setUIScale,
    isSettingsOpen,
    setIsSettingsOpen
  } = useUIStore();
  const isResizing = useRef(false);

  // Apply scaling on boot
  useEffect(() => {
    document.documentElement.style.fontSize = `${uiScale * 16}px`;
  }, [uiScale]);

  const startResizing = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = e.clientX;
    if (newWidth >= 260 && newWidth <= 480) {
      setSidebarWidth(newWidth);
    }
  }, [setSidebarWidth]);

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
  const hideConversation = useMutation((api as any).messages.hideConversation);

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

  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);

  // Get pending group invites
  const pendingInvites = useQuery((api as any).messages.getPendingInvites, {});
  const suggestedUsers = useQuery((api as any).messages.getSuggestedUsers, {});
  const acceptGroupInvite = useMutation((api as any).messages.acceptGroupInvite);
  const rejectGroupInvite = useMutation((api as any).messages.rejectGroupInvite);
  const sendGroupInvite = useMutation((api as any).messages.sendGroupInvite);
  const getGroupMembers = useQuery(
    selectedConversationId && (conversations?.find((c: any) => c._id === selectedConversationId)?.isGroup)
      ? (api as any).messages.getGroupMembers
      : "skip",
    selectedConversationId && (conversations?.find((c: any) => c._id === selectedConversationId)?.isGroup)
      ? { conversationId: selectedConversationId as any }
      : "skip"
  );

  const handleSendMessage = async (messageBody: string, replyTo?: string, replyToUser?: string) => {
    if (!selectedConversationId || !messageBody.trim() || isSending) return;

    setIsSending(true);
    setError(null);
    try {
      await sendMessage({
        conversationId: selectedConversationId as any,
        body: messageBody,
        replyTo,
        replyToUser,
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      const conversationId = await acceptGroupInvite({ inviteId: inviteId as any });
      setSelectedConversationId(conversationId);
    } catch (err) {
      console.error("Failed to accept invite:", err);
      setError("Failed to accept invite. Please try again.");
    }
  };

  const handleRejectInvite = async (inviteId: string) => {
    try {
      await rejectGroupInvite({ inviteId: inviteId as any });
    } catch (err) {
      console.error("Failed to reject invite:", err);
      setError("Failed to reject invite. Please try again.");
    }
  };

  const handleSendGroupInvites = async (userIds: string[]) => {
    if (!selectedConversationId) return;
    try {
      await sendGroupInvite({
        conversationId: selectedConversationId as any,
        invitedUserIds: userIds as any,
      });
    } catch (err) {
      console.error("Failed to send invites:", err);
      setError("Failed to send invites. Please try again.");
    }
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

    return {
      name: conv.name,
      message: conv.isTyping ? "Typing..." : (conv.lastMessage || "No messages yet"),
      time: timeAgo,
      active: selectedConversationId === conv._id,
      conversationId: conv._id,
      isUser: false,
      isOnline: conv.isOnline,
      unreadCount: conv.unreadCount || 0,
      imageUrl: conv.imageUrl,
      isGroup: conv.isGroup,
      memberCount: conv.memberCount,
    };
  });

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const createGroup = useMutation((api as any).messages.createGroup);
  const allUsers = useQuery(api.users.listUsers, {});

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedParticipants.length === 0) return;
    const conversationId = await createGroup({
      participantIds: selectedParticipants as any,
      name: groupName,
    });
    setSelectedConversationId(conversationId);
    setIsGroupModalOpen(false);
    setGroupName("");
    setSelectedParticipants([]);
  };

  const displayItems = searchValue.trim() !== "" ? searchItems : chatItems;

  return (
    <main className="flex h-screen flex-col bg-zinc-100 relative">
      <MainHeader />

      <div className="flex min-h-0 flex-1 relative overflow-hidden">
        {/* Sidebar - hidden on mobile when a chat is selected */}
        <div
          className={`lg:flex shrink-0 flex-col border-r border-zinc-200 bg-white group/sidebar relative ${selectedConversationId ? 'hidden' : 'flex w-full'}`}
          style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${sidebarWidth}px` : undefined }}
        >
          <GroupInvitesPanel
            invites={pendingInvites ?? []}
            onAccept={handleAcceptInvite}
            onReject={handleRejectInvite}
          />
          <ChatSidebar
            userName={(currentUser?.name || user?.firstName || "User").split(',')[0].trim()}
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
            onCreateGroup={() => setIsGroupModalOpen(true)}
            suggestedUsers={suggestedUsers}
            onUserSelect={handleSelectUser}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          {/* Resize Handle */}
          <div
            onMouseDown={startResizing}
            className="absolute -right-1 top-0 bottom-0 w-2 cursor-col-resize z-50 hover:bg-indigo-500/20 active:bg-indigo-500/40 transition-colors hidden lg:block"
          />
        </div>

        {/* Chat Window - takes full width on mobile when selected */}
        <div className={`flex min-h-0 flex-1 flex-col min-w-0 ${!selectedConversationId ? 'hidden lg:flex' : 'flex'}`}>
          {selectedConversationId && messages ? (
            <ChatWindow
              messages={messages}
              onSendMessage={handleSendMessage}
              onBack={() => setSelectedConversationId(null)}
              selectedConversation={conversations?.find((c: any) => c._id === selectedConversationId)}
              currentUserId={currentUser?._id}
              isSending={isSending}
              error={error}
              isGroupChat={conversations?.find((c: any) => c._id === selectedConversationId)?.isGroup}
              groupMembers={getGroupMembers ?? []}
              onAddMembers={() => setIsAddMembersOpen(true)}
              onDelete={async () => {
                if (selectedConversationId) {
                  await hideConversation({ conversationId: selectedConversationId as any });
                  setSelectedConversationId(null);
                }
              }}
            />
          ) : (
            <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-[#efeae2]/30 space-y-4">
              <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm">
                💬
              </div>
              <p className="text-zinc-500 font-medium">Select a chat to start messaging</p>
            </div>
          )}
        </div>

        {/* Right Sidebar - hidden on mobile */}
        <div className="hidden xl:block">
          <ChatRightSidebar onChatSelect={handleSelectChat} />
        </div>
      </div>

      {/* Create Group Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h2 className="font-bold text-zinc-900">Create New Group</h2>
              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 tracking-wider block mb-1.5 uppercase">Group Name</label>
                <input
                  type="text"
                  placeholder="Enter group name..."
                  className="w-full border text-black border-zinc-200 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 outline-none transition-colors"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 tracking-wider block mb-1.5 uppercase">Add Members</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {allUsers === undefined ? (
                    <div className="text-center py-4 text-xs text-zinc-400 italic">Finding users...</div>
                  ) : allUsers.length === 0 ? (
                    <div className="text-center py-4 text-xs text-zinc-400">No users found</div>
                  ) : (
                    allUsers.map((u: any) => (
                      <label
                        key={u._id}
                        className={`flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer ${selectedParticipants.includes(u._id)
                          ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                          : 'border-zinc-100 hover:border-zinc-200 bg-white'
                          }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={selectedParticipants.includes(u._id)}
                          onChange={() => {
                            if (selectedParticipants.includes(u._id)) {
                              setSelectedParticipants(selectedParticipants.filter(id => id !== u._id));
                            } else {
                              setSelectedParticipants([...selectedParticipants, u._id]);
                            }
                          }}
                        />
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                          {u.name?.[0] || 'U'}
                        </div>
                        <span className="text-sm font-medium text-zinc-700 flex-1">{u.name}</span>
                        {selectedParticipants.includes(u._id) && (
                          <div className="h-4 w-4 bg-indigo-600 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 border-t border-zinc-100">
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedParticipants.length === 0}
                className="w-full bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Members to Group Modal */}
      {isAddMembersOpen && selectedConversationId && (
        <GroupMembersModal
          isOpen={isAddMembersOpen}
          groupName={conversations?.find((c: any) => c._id === selectedConversationId)?.name || "Group"}
          currentMembers={getGroupMembers ?? []}
          allUsers={allUsers ?? []}
          onClose={() => setIsAddMembersOpen(false)}
          onInvite={handleSendGroupInvites}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        uiScale={uiScale}
        onScaleChange={setUIScale}
      />
    </main>
  );
}

function ChatWindow({
  messages,
  onSendMessage,
  onBack,
  selectedConversation,
  currentUserId,
  isSending,
  error,
  isGroupChat,
  groupMembers,
  onAddMembers,
  onDelete,
}: {
  messages: any[];
  onSendMessage: (message: string) => void;
  onBack: () => void;
  selectedConversation?: any;
  currentUserId?: string;
  isSending?: boolean;
  error?: string | null;
  isGroupChat?: boolean;
  groupMembers?: any[];
  onAddMembers?: () => void;
  onDelete?: () => void;
}) {
  const { user } = useUser();
  const userName = user?.firstName || "the user";
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string, body: string, user: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const setTyping = useMutation((api as any).messages.setTyping);
  const clearTyping = useMutation((api as any).messages.clearTyping);
  const deleteMessage = useMutation((api as any).messages.deleteMessage);
  const toggleReaction = useMutation((api as any).messages.toggleReaction);

  const handleTyping = () => {
    if (!selectedConversation?._id) return;
    setTyping({ conversationId: selectedConversation._id });
  };

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    const currentInput = input;
    const currentReplyTo = replyTo;

    setInput("");
    setReplyTo(null);

    if (selectedConversation?._id) {
      clearTyping({ conversationId: selectedConversation._id });
    }

    try {
      await (onSendMessage as any)(currentInput, currentReplyTo?.body, currentReplyTo?.user);
    } catch (err) {
      console.error("Failed to send:", err);
    }

    // Force scroll to bottom after sending
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleGetAiSuggestions = async () => {
    // Don't try to get suggestions if there's no context
    if (messages.length === 0 && !replyTo) {
      console.log("No messages or reply context for AI suggestions");
      setAiSuggestions([]);
      setIsAiModalOpen(true);
      return;
    }

    setIsAiLoading(true);
    setIsAiModalOpen(true);
    try {
      let context = messages.slice(-5).map(m => {
        const sender = m.sender?.name || "User";
        const body = m.body || "";
        return `${sender}: ${body}`;
      }).join("\n");

      if (replyTo) {
        context = `REPLYING TO [${replyTo.user}: ${replyTo.body}]\n\nRecent History:\n${context}`;
      }

      console.log("Context prepared for AI:", context.substring(0, 100) + "...");

      if (!context.trim()) {
        console.log("Context is empty after processing");
        setAiSuggestions([]);
        setIsAiLoading(false);
        return;
      }

      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          userName: "the user"
        })
      });

      console.log("API response status:", res.status);

      if (!res.ok) {
        console.error("AI API error:", res.status);
        setAiSuggestions([]);
        setIsAiLoading(false);
        return;
      }

      const data = await res.json();
      console.log("API response data:", data);
      
      if (data.error) {
        console.error("AI error:", data.error);
        setAiSuggestions([]);
      } else if (Array.isArray(data.suggestions)) {
        console.log("Suggestions received:", data.suggestions.length);
        setAiSuggestions(data.suggestions);
      } else {
        console.warn("Unexpected response format:", data);
        setAiSuggestions([]);
      }
    } catch (err) {
      console.error("AI fetch failed:", err);
      setAiSuggestions([]);
    } finally {
      setIsAiLoading(false);
    }
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
            aria-label="Back to conversations"
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
            <span className="text-xs text-zinc-500">
              {isGroupChat
                ? `${groupMembers?.length || 0} members`
                : selectedConversation?.isOnline ? 'Online' : 'Offline'
              }
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to delete this conversation? This will hide it from your list.")) {
                  onDelete();
                }
              }}
              className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Chat"
              aria-label="Delete Conversation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}

          {isGroupChat && onAddMembers && (
            <button
              onClick={onAddMembers}
              className="p-2 text-zinc-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Group Details"
              aria-label="View Group Details and Members"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-[#efeae2] p-4 lg:p-6 space-y-2 relative"
      >
        {/* Error Notification */}
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-xs shadow-md z-30 flex items-center gap-2 max-w-[90%] w-max">
            <span>{error}</span>
            <button onClick={() => { }} className="font-bold underline">Retry</button>
          </div>
        )}

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
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1 group relative`}
                >
                  {!isMine && (
                    <div className="mr-2 mt-auto shrink-0">
                      {msg.sender.imageUrl ? (
                        <img src={msg.sender.imageUrl} alt={msg.sender.name} className="h-7 w-7 rounded-full object-cover shadow-sm" />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-indigo-200" />
                      )}
                    </div>
                  )}

                  <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[85%] lg:max-w-[70%]`}>
                    <div
                      className={`rounded-2xl px-3 py-1.5 shadow-sm relative transition-all ${isMine
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white text-zinc-800 rounded-tl-none'
                        }`}
                    >
                      {!isMine && msg.sender.name && (
                        <p className="text-[11px] font-bold text-indigo-600 mb-0.5">{msg.sender.name}</p>
                      )}

                      {msg.replyTo && (
                        <div className={`mb-2 p-2 rounded-lg border-l-4 text-xs ${isMine ? 'bg-white/10 border-white/30 text-white/90' : 'bg-zinc-50 border-indigo-200 text-zinc-500'} italic`}>
                          <p className="font-bold not-italic mb-0.5 text-[10px] uppercase opacity-70">
                            {msg.replyToUser || 'User'} said:
                          </p>
                          <p className="line-clamp-2">{msg.replyTo}</p>
                        </div>
                      )}

                      <p className={`text-[14px] leading-relaxed whitespace-pre-wrap break-all ${msg.deleted ? 'italic text-opacity-70' : ''}`}>
                        {msg.body}
                      </p>

                      <div className={`text-[10px] mt-1 flex justify-end gap-2 items-center ${isMine ? 'text-white/70' : 'text-zinc-400'}`}>
                        {formatMessageTimestamp(msg.createdAt)}

                        {/* Delete button for own messages */}
                        {isMine && !msg.deleted && (
                          <button
                            onClick={() => deleteMessage({ messageId: msg._id })}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-white/50 hover:text-white"
                            title="Delete message"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Reaction Picker Popover (Desktop) */}
                      {!msg.deleted && (
                        <div className={`absolute top-0 ${isMine ? 'right-full mr-2' : 'left-full ml-2'} opacity-0 group-hover:opacity-100 flex gap-1 bg-white shadow-lg rounded-full px-2 py-1 border border-zinc-100 z-20 transition-all scale-90 group-hover:scale-100`}>
                          <button
                            onClick={() => setReplyTo({ id: msg._id, body: msg.body, user: msg.sender.name })}
                            className="hover:scale-125 transition-transform p-1 text-zinc-400 hover:text-indigo-600"
                            title="Reply"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                          </button>
                          {['👍', '❤️', '😂', '😮', '😢'].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => toggleReaction({ messageId: msg._id, emoji })}
                              className={`hover:scale-125 transition-transform p-0.5 ${msg.reactions?.[currentUserId || ''] === emoji ? 'bg-indigo-50 rounded-full' : ''}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reactions Display */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className={`flex gap-1 mt-[-6px] z-10 ${isMine ? 'mr-2' : 'ml-2'}`}>
                        {msg.reactions.map(({ emoji, count }: { emoji: string, count: number }) => (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction({ messageId: msg._id, emoji })}
                            className={`flex items-center gap-1 bg-white rounded-full px-1.5 py-0.5 border border-zinc-100 shadow-sm text-[11px] hover:bg-zinc-50 transition-colors ${msg.userReaction === emoji ? 'border-indigo-200 bg-indigo-50' : ''}`}
                          >
                            <span>{emoji}</span>
                            <span className="font-medium text-zinc-600">{count}</span>
                          </button>
                        ))}
                      </div>
                    )}
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

      {/* Reply Preview */}
      {replyTo && (
        <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-1 bg-indigo-500 h-8 rounded-full shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Replying to {replyTo.user}</p>
              <p className="text-xs text-zinc-500 truncate font-medium">{replyTo.body}</p>
            </div>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="h-6 w-6 flex items-center justify-center rounded-full bg-zinc-200 text-zinc-500 hover:bg-zinc-300 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      <div className="border-t border-zinc-200 bg-white px-4 py-3 shrink-0">
        <div className="flex items-center gap-2 rounded-2xl border border-zinc-100 bg-zinc-50 px-3 py-2">
          <button
            onClick={handleGetAiSuggestions}
            className="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all cursor-pointer group"
            title="AI Suggest Reply"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">✨</span>
          </button>
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
            disabled={!input.trim() || isSending}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm disabled:opacity-50 disabled:bg-zinc-300 transition-colors"
          >
            {isSending ? (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <AISuggestionsModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        isLoading={isAiLoading}
        suggestions={aiSuggestions}
        hasMessages={messages.length > 0}
        onSelect={(s) => {
          setInput(s);
          setIsAiModalOpen(false);
        }}
      />
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