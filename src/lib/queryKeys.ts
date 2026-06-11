/**
 * Centralised React Query keys. Using a factory keeps invalidation
 * targeted and prevents typo-driven cache misses.
 */

export const qk = {
  posts: {
    all: ["posts"] as const,
    list: (filter?: string) => ["posts", "list", filter ?? "feed"] as const,
    one: (id: string) => ["posts", id] as const,
    comments: (id: string) => ["posts", id, "comments"] as const,
  },
  users: {
    all: ["users"] as const,
    directory: ["users", "directory"] as const,
    one: (uid: string) => ["users", uid] as const,
    profile: (uid: string) => ["users", uid, "profile"] as const,
  },
  stories: {
    all: ["stories"] as const,
    active: ["stories", "active"] as const,
  },
  chats: {
    all: ["chats"] as const,
    list: (uid: string) => ["chats", "list", uid] as const,
    messages: (chatId: string) => ["chats", chatId, "messages"] as const,
  },
  notifications: (uid: string) => ["notifications", uid] as const,
} as const;
