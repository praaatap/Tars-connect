import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get current user helper
export async function getCurrentUserHelper(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q: any) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique();
}

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUserHelper(ctx);
  },
});

export const searchUsers = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserHelper(ctx);
    if (!currentUser) return [];

    let users;
    if (args.query.trim() === "") {
      users = await ctx.db.query("users").collect();
    } else {
      users = await ctx.db
        .query("users")
        .withSearchIndex("search_name", (q) => q.search("name", args.query))
        .collect();
    }

    return users.filter((user) => user._id !== currentUser._id);
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    return allUsers;
  },
});
export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUserHelper(ctx);
    if (!currentUser) return [];

    return (await ctx.db.query("users").collect()).filter(
      (user) => user._id !== currentUser._id
    );
  },
});

export const updatePresence = mutation({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUserHelper(ctx);
    if (!currentUser) return;

    await ctx.db.patch(currentUser._id, {
      lastSeenAt: Date.now(),
    });
  },
});
