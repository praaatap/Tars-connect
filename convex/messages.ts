import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get current user (read-only for queries)
async function getCurrentUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  let user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q: any) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();

  return user || null;
}

// Initialize or update user (call from mutations)
async function initializeOrUpdateUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  let user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q: any) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();

  if (user) {
    await ctx.db.patch(user._id, {
      name: identity.name,
      email: identity.email,
      imageUrl: identity.pictureUrl,
      lastSeenAt: Date.now(),
    });
  } else {
    const userId = await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name,
      email: identity.email,
      imageUrl: identity.pictureUrl,
      lastSeenAt: Date.now(),
    });
    user = await ctx.db.get(userId);
  }

  return user;
}

// Initialize user on first login (call this first)
export const initializeUser = mutation({
  args: {},
  handler: async (ctx) => {
    return await initializeOrUpdateUser(ctx);
  },
});

export const createGroup = mutation({
  args: {
    participantIds: v.array(v.id("users")),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);
    const now = Date.now();

    // Include current user in participants
    const participants = Array.from(new Set([...args.participantIds, currentUser._id]));

    const conversationId = await ctx.db.insert("conversations", {
      participants,
      isGroup: true,
      name: args.name,
      lastMessageAt: now,
    });

    return conversationId;
  },
});

// Get all conversations for current user (DMs)
export const getConversations = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return [];

    const conversations = await ctx.db
      .query("conversations")
      .collect();

    const userConversations = conversations.filter((c: any) =>
      c.participants.map((p: any) => p.toString()).includes(currentUser._id.toString()) &&
      !(c.hiddenBy || []).map((h: any) => h.toString()).includes(currentUser._id.toString()) &&
      (c.isGroup || c.lastMessage) // Don't show empty DMs
    );

    const sorted = userConversations.sort((a, b) => b.lastMessageAt - a.lastMessageAt);

    const withUserInfo = await Promise.all(
      sorted.map(async (conv: any) => {
        let name = conv.name;
        let imageUrl = undefined;
        let otherUserId = undefined;

        if (!conv.isGroup) {
          otherUserId = conv.participants.find((id: any) => id !== currentUser._id);
          const otherUser: any = await ctx.db.get(otherUserId);
          name = otherUser?.name || "User";
          imageUrl = otherUser?.imageUrl;
        }

        // Count unread messages
        const lastReadAt = conv.lastReadAt?.[currentUser._id] || 0;
        const unreadMessages = await ctx.db
          .query("messages")
          .withIndex("by_conversation_createdAt", (q: any) =>
            q.eq("conversationId", conv._id).gt("createdAt", lastReadAt)
          )
          .collect();

        const unreadCount = unreadMessages.filter((m: any) => m.senderId !== currentUser._id).length;

        // Fetch isTyping for group or DM
        let isTyping = false;
        if (conv.typing) {
          const now = Date.now();
          isTyping = Object.entries(conv.typing).some(([uid, time]: [string, any]) =>
            uid !== currentUser._id.toString() && (now - time) < 3000
          );
        }

        // Determine online status for DMs
        let isOnline = false;
        if (!conv.isGroup && otherUserId) {
          const otherUser: any = await ctx.db.get(otherUserId);
          if (otherUser?.lastSeenAt) {
            isOnline = (Date.now() - otherUser.lastSeenAt) < 60000;
          }
        }

        return {
          _id: conv._id,
          name: name || "Group",
          imageUrl,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          otherUserId,
          isGroup: !!conv.isGroup,
          isOnline,
          memberCount: conv.participants.length,
          unreadCount,
          isTyping,
        };
      })
    );

    return withUserInfo;
  },
});

export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);
    const message = await ctx.db.get(args.messageId);
    if (!message || message.senderId !== currentUser._id) return;

    await ctx.db.patch(args.messageId, { deleted: true });
  },
});

export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);
    const message = await ctx.db.get(args.messageId);
    if (!message) return;

    const reactions = message.reactions || {};
    const userId = currentUser._id;

    if (reactions[userId] === args.emoji) {
      // Remove if same emoji
      const { [userId]: _, ...rest } = reactions;
      await ctx.db.patch(args.messageId, { reactions: rest });
    } else {
      // Set/update emoji
      await ctx.db.patch(args.messageId, {
        reactions: { ...reactions, [userId]: args.emoji }
      });
    }
  },
});

// Get messages for a specific conversation
export const getMessagesForConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_createdAt", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();

    return Promise.all(
      messages.map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);

        // Format reactions as an array of { emoji, count } for Convex compatibility
        const reactions: { emoji: string; count: number }[] = [];
        if (msg.reactions) {
          const counts: Record<string, number> = {};
          Object.values(msg.reactions).forEach(emoji => {
            counts[emoji] = (counts[emoji] || 0) + 1;
          });
          Object.entries(counts).forEach(([emoji, count]) => {
            reactions.push({ emoji, count });
          });
        }

        return {
          ...msg,
          body: msg.deleted ? "This message was deleted" : msg.body,
          sender: {
            _id: sender?._id,
            name: sender?.name || "User",
            imageUrl: sender?.imageUrl
          },
          reactions,
          userReaction: currentUser ? msg.reactions?.[currentUser._id] : undefined,
          replyTo: msg.replyTo,
          replyToUser: msg.replyToUser,
        };
      })
    );
  },
});

// Send a message in a conversation
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    body: v.string(),
    replyTo: v.optional(v.string()),
    replyToUser: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);
    const normalized = args.body.trim();

    if (!normalized) {
      return null;
    }

    const now = Date.now();

    // Insert message
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: currentUser._id,
      body: normalized,
      createdAt: now,
      replyTo: args.replyTo,
      replyToUser: args.replyToUser,
    });

    // Update conversation's last message
    await ctx.db.patch(args.conversationId, {
      lastMessage: normalized,
      lastMessageAt: now,
      lastMessageSenderId: currentUser._id,
      // Clear typing for this user when they send a message
      typing: {
        ...((await ctx.db.get(args.conversationId))?.typing || {}),
        [currentUser._id]: 0,
      },
      // Automatically mark as read for the sender
      lastReadAt: {
        ...((await ctx.db.get(args.conversationId))?.lastReadAt || {}),
        [currentUser._id]: now,
      },
      hiddenBy: [], // Reset hidden status when a new message is sent
    });

    return messageId;
  },
});

// Hide a conversation (soft delete for the user)
export const hideConversation = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);
    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) return;

    const hiddenBy = conversation.hiddenBy || [];
    if (!hiddenBy.map((id: any) => id.toString()).includes(currentUser._id.toString())) {
      await ctx.db.patch(args.conversationId, {
        hiddenBy: [...hiddenBy, currentUser._id],
      });
    }
  },
});

export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return;

    await ctx.db.patch(args.conversationId, {
      lastReadAt: {
        ...(conversation.lastReadAt || {}),
        [currentUser._id]: Date.now(),
      },
    });
  },
});

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return;

    await ctx.db.patch(args.conversationId, {
      typing: {
        ...(conversation.typing || {}),
        [currentUser._id]: Date.now(),
      },
    });
  },
});

export const clearTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return;

    const newTyping = { ...(conversation.typing || {}) };
    delete newTyping[currentUser._id];

    await ctx.db.patch(args.conversationId, {
      typing: newTyping,
    });
  },
});

// Create or get conversation with another user
export const getOrCreateConversation = mutation({
  args: {
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);

    const participants = [currentUser._id, args.otherUserId].sort();

    // Check if conversation already exists
    const existing = (await ctx.db.query("conversations").collect()).find(
      (conv: any) => {
        const convParticipants = conv.participants.sort();
        return (
          convParticipants.length === 2 &&
          convParticipants[0] === participants[0] &&
          convParticipants[1] === participants[1]
        );
      }
    );

    if (existing) {
      return existing._id;
    }

    // Create new conversation
    return await ctx.db.insert("conversations", {
      participants,
      lastMessageAt: Date.now(),
      lastMessage: undefined,
    });
  },
});

export const getSuggestedUsers = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return [];

    // Get all conversations for current user to exclude existing contacts
    const conversations = await ctx.db
      .query("conversations")
      .collect();

    const existingParticipantIds = new Set(
      conversations
        .filter((c: any) => c.participants.includes(currentUser._id))
        .flatMap((c: any) => c.participants.map((id: any) => id.toString()))
    );

    const users = await ctx.db.query("users").collect();

    // Filter out: current user AND people who already have a conversation
    return users
      .filter((u: any) =>
        u._id.toString() !== currentUser._id.toString() &&
        !existingParticipantIds.has(u._id.toString())
      )
      .slice(0, 5); // Limit to 5 suggestions
  },
});

// Send group chat invites
export const sendGroupInvite = mutation({
  args: {
    conversationId: v.id("conversations"),
    invitedUserIds: v.array(v.id("users")),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);
    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation || !conversation.participants.includes(currentUser._id)) {
      throw new Error("Not a member of this group");
    }

    const now = Date.now();
    const inviteIds: any[] = [];

    for (const userId of args.invitedUserIds) {
      // Check if already a member
      if (conversation.participants.includes(userId)) {
        continue;
      }

      // Check if invite already exists
      const existingInvites = await ctx.db
        .query("groupChatInvites")
        .collect();

      const existingInvite = existingInvites.find((invite: any) =>
        invite.conversationId === args.conversationId &&
        invite.invitedUserId === userId &&
        invite.status === "pending"
      );

      if (!existingInvite) {
        const inviteId = await ctx.db.insert("groupChatInvites", {
          conversationId: args.conversationId,
          invitedUserId: userId,
          invitedByUserId: currentUser._id,
          status: "pending",
          message: args.message,
          createdAt: now,
        });
        inviteIds.push(inviteId);
      }
    }

    return inviteIds;
  },
});

// Get pending invites for current user
export const getPendingInvites = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return [];

    const invites = await ctx.db
      .query("groupChatInvites")
      .withIndex("by_invited_user_status", (q: any) =>
        q.eq("invitedUserId", currentUser._id).eq("status", "pending")
      )
      .collect();

    return Promise.all(
      invites.map(async (invite: any) => {
        const conversation: any = await ctx.db.get(invite.conversationId);
        const invitedBy: any = await ctx.db.get(invite.invitedByUserId);

        // Find other people invited to the same group
        const allInvites = await ctx.db.query("groupChatInvites").collect();
        const otherInvitedDetails = await Promise.all(
          allInvites
            .filter((i: any) => i.conversationId === invite.conversationId && i.invitedUserId !== currentUser._id && i.status === "pending")
            .slice(0, 3)
            .map(async (i: any) => {
              const u: any = await ctx.db.get(i.invitedUserId);
              return u?.name || "User";
            })
        );

        return {
          _id: invite._id,
          conversationId: invite.conversationId,
          conversationName: conversation?.name || "Group Chat",
          conversationImage: undefined,
          invitedBy: invitedBy?.name || "User",
          invitedByImage: invitedBy?.imageUrl,
          otherInvitedUsers: otherInvitedDetails,
          message: invite.message,
          status: invite.status,
          createdAt: invite.createdAt,
        };
      })
    );
  },
});

// Accept group chat invite
export const acceptGroupInvite = mutation({
  args: {
    inviteId: v.id("groupChatInvites"),
  },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);
    const invite = await ctx.db.get(args.inviteId);

    if (!invite || invite.invitedUserId !== currentUser._id) {
      throw new Error("Invite not found or not for this user");
    }

    if (invite.status !== "pending") {
      throw new Error("Invite already responded to");
    }

    const conversation = await ctx.db.get(invite.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Add user to conversation participants
    const updatedParticipants = Array.from(
      new Set([...conversation.participants, currentUser._id])
    );

    await ctx.db.patch(invite.conversationId, {
      participants: updatedParticipants,
    });

    // Mark invite as accepted
    await ctx.db.patch(args.inviteId, {
      status: "accepted",
      respondedAt: Date.now(),
    });

    return invite.conversationId;
  },
});

// Reject group chat invite
export const rejectGroupInvite = mutation({
  args: {
    inviteId: v.id("groupChatInvites"),
  },
  handler: async (ctx, args) => {
    const currentUser = await initializeOrUpdateUser(ctx);
    const invite = await ctx.db.get(args.inviteId);

    if (!invite || invite.invitedUserId !== currentUser._id) {
      throw new Error("Invite not found or not for this user");
    }

    if (invite.status !== "pending") {
      throw new Error("Invite already responded to");
    }

    await ctx.db.patch(args.inviteId, {
      status: "rejected",
      respondedAt: Date.now(),
    });
  },
});

// Get group members
export const getGroupMembers = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return [];

    return Promise.all(
      conversation.participants.map(async (userId: any) => {
        const user: any = await ctx.db.get(userId);
        return {
          _id: user?._id,
          name: user?.name || "User",
          imageUrl: user?.imageUrl,
          email: user?.email,
        };
      })
    );
  },
});
