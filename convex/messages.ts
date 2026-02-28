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

// Get all conversations for current user (DMs)
export const getConversations = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return [];

    const conversations = await ctx.db.query("conversations").collect();

    const userConversations = conversations
      .filter((conv: any) =>
        conv.participants.includes(currentUser._id)
      )
      .sort((a: any, b: any) => b.lastMessageAt - a.lastMessageAt)
      .map((conv: any) => {
        const otherUserId = conv.participants.find(
          (id: any) => id !== currentUser._id
        );
        return {
          ...conv,
          otherUserId,
        };
      });

    // Fetch other users' info for display
    const withUserInfo = await Promise.all(
      userConversations.map(async (conv: any) => {
        const otherUser: any = await ctx.db.get(conv.otherUserId);
        return {
          _id: conv._id,
          name: otherUser?.name || "User",
          email: otherUser?.email,
          imageUrl: otherUser?.imageUrl,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          otherUserId: conv.otherUserId,
          lastSeenAt: otherUser?.lastSeenAt,
        };
      })
    );

    return withUserInfo;
  },
});

// Get messages for a specific conversation
export const getMessagesForConversation = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_createdAt", (q: any) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();

    return await Promise.all(
      messages.map(async (msg: any) => {
        const sender: any = await ctx.db.get(msg.senderId);
        return {
          _id: msg._id,
          body: msg.body,
          createdAt: msg.createdAt,
          sender: {
            _id: sender?._id,
            name: sender?.name || "User",
            imageUrl: sender?.imageUrl,
          },
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
    });

    return messageId;
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
