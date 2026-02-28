import { query } from "./_generated/server";
import { v } from "convex/values";

// Example query that requires authentication
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return {
      userId: identity.subject,
      name: identity.name,
      email: identity.email,
      tokenIdentifier: identity.tokenIdentifier,
    };
  },
});

// Example query accessible to everyone
export const getPublicMessage = query({
  args: {},
  handler: async (ctx) => {
    return {
      message: "This is accessible to everyone!",
      timestamp: Date.now(),
    };
  },
});
