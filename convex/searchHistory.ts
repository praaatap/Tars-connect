import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      return [];
    }

    const items = await ctx.db
      .query("userSearchHistory")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(8);

    return items.map((item) => ({
      _id: item._id,
      query: item.query,
      createdAt: item.createdAt,
    }));
  },
});

export const addForCurrentUser = mutation({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const normalized = args.query.trim();
    if (!normalized) {
      return null;
    }

    let user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
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

    if (!user) {
      throw new Error("Unable to resolve user");
    }

    const now = Date.now();

    const existing = await ctx.db
      .query("userSearchHistory")
      .withIndex("by_user_query", (q) =>
        q.eq("userId", user._id).eq("query", normalized),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { createdAt: now });
      return existing._id;
    }

    return await ctx.db.insert("userSearchHistory", {
      userId: user._id,
      query: normalized,
      createdAt: now,
    });
  },
});