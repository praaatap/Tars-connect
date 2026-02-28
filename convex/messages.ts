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
    const currentUser = await initializeOrUpdateUser(ctx);

    const conversations = await ctx.db
      .query("conversations")
      .collect();

    const userConversations = conversations.filter((c: any) =>
      c.participants.includes(currentUser._id)
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

        return {
          _id: conv._id,
          name: name || "Group",
          imageUrl,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          otherUserId,
          isGroup: !!conv.isGroup,
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
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_createdAt", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();

    return Promise.all(
      messages.map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);

        // Calculate reaction counts
        const reactionCounts: Record<string, number> = {};
        if (msg.reactions) {
          Object.values(msg.reactions).forEach(emoji => {
            reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
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
          reactionCounts,
          userReaction: msg.reactions?.[sender?._id || ""], // We need current user ID context usually, but we can handle this in UI
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
      }
    });

    return messageId;
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const currentUser = await getCurrentUser(ctx);
    const users = await ctx.db.query("users").collect();

    if (!currentUser) return users;

    return users.filter((u: any) => u._id !== currentUser._id).slice(0, 10);
  },
});
