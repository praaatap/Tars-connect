import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    lastSeenAt: v.number(),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .searchIndex("search_name", {
      searchField: "name",
    }),

  userSearchHistory: defineTable({
    userId: v.id("users"),
    query: v.string(),
    createdAt: v.number(),
  })
    .index("by_user_createdAt", ["userId", "createdAt"])
    .index("by_user_query", ["userId", "query"]),

  conversations: defineTable({
    participants: v.array(v.id("users")),
    isGroup: v.optional(v.boolean()),
    name: v.optional(v.string()),
    lastMessageAt: v.number(),
    lastMessage: v.optional(v.string()),
    lastMessageSenderId: v.optional(v.id("users")),
    typing: v.optional(v.record(v.string(), v.number())),
    lastReadAt: v.optional(v.record(v.string(), v.number())),
  }).index("by_participants", ["participants"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    body: v.string(),
    createdAt: v.number(),
    deleted: v.optional(v.boolean()),
    reactions: v.optional(v.record(v.string(), v.string())),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_conversation_createdAt", ["conversationId", "createdAt"]),
});